import { supabase } from "../config/supabase.js";


export const createPost = async (req, res) => {
  try {
    const { heading, description, date, isPublic, userId, userEmail } = req.body;
    let fileUrl = null;

    if (req.file) {
      try {
        const fileName = `${Date.now()}-${req.file.originalname}`;
        
        console.log(`Attempting upload to Supabase: ${fileName}`);
        const { data, error } = await supabase.storage
          .from("posts")
          .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: true
          });

        if (error) {
          console.warn("Supabase Storage Upload failed (continuing without file):", error.message);
        } else {
          const { data: publicData } = supabase.storage
            .from("posts")
            .getPublicUrl(fileName);
          
          fileUrl = publicData.publicUrl;
          console.log("File uploaded successfully:", fileUrl);
        }
      } catch (storageErr) {
        console.warn("Graceful Storage Error:", storageErr.message);
      }
    }

    // Ensure date is in YYYY-MM-DD format
    const formattedDate = date ? date.split('T')[0] : new Date().toISOString().split('T')[0];

    const { data: post, error: dbError } = await supabase
      .from("posts")
      .insert([
        {
          heading,
          description,
          file: fileUrl,
          date: formattedDate,
          is_public: isPublic === "true" || isPublic === true,
          user_id: userId && userId !== "" ? userId : null,
          user_email: userEmail || 'Anonymous'
        },
      ])
      .select();

    if (dbError) {
      console.error("Critical DB Insert Error:", dbError.message);
      console.error("Error Code:", dbError.code);
      console.error("Hint:", dbError.hint);
      
      // साफ़ एरर रिस्पोंस
      return res.status(500).json({ 
        message: "Database Sync Failed", 
        error: dbError.message,
        hint: "Did you run the SQL script in Supabase? Check if 'user_id' column exists."
      });
    }

    console.log("Post created successfully in database");
    res.status(201).json(post[0]);
  } catch (error) {
    console.error("Critical Post Creation Failure:", error);
    res.status(500).json({ 
      message: "Intelligence Sync Failed", 
      detail: error.message,
      hint: "Check if 'posts' table exists and RLS allows inserts." 
    });
  }
};

export const getPosts = async (req, res) => {
  try {
    const { userId } = req.query;
    let query = supabase
      .from("posts")
      .select(`
        *,
        custom_users:user_id (
          username
        ),
        post_likes(user_id)
      `);

    if (userId) {
      // Show ALL public posts OR posts owned by THIS user
      query = query.or(`is_public.eq.true,user_id.eq.${userId}`);
    } else {
      // Only show public posts for guests
      query = query.eq("is_public", true);
    }

    const { data, error } = await query.order("id", { ascending: false });

    if (error) throw error;

    // Process data to include like_count and is_liked
    const processedData = (data || []).map(post => ({
      ...post,
      likes_count: post.post_likes ? post.post_likes.length : 0,
      is_liked: userId ? post.post_likes.some(l => String(l.user_id) === String(userId)) : false
    }));

    res.status(200).json(processedData);
  } catch (error) {
    console.error("Fetch Posts Error:", error.message);
    res.status(500).json({ message: "Intelligence Retrieval Failed", error: error.message });
  }
};

export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    let { userId } = req.query; 

    // Clean userId if it's passed as a string 'undefined' or 'null'
    if (userId === 'undefined' || userId === 'null') userId = null;

    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        custom_users:user_id (
          username,
          avatar_url
        )
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: "Intelligence Node Not Found" });

    // Privacy Check
    if (!data.is_public && String(data.user_id) !== String(userId)) {
      return res.status(403).json({ message: "Secure Node: Access Denied" });
    }
    
    res.status(200).json(data);
  } catch (error) {
    console.error("Fetch Post Error:", error.message);
    res.status(404).json({ message: "Intelligence Node Inaccessible", error: error.message });
  }
};

export const downloadPostFile = async (req, res) => {
  try {
    const { id } = req.params;
    let { userId } = req.query;

    if (userId === 'undefined' || userId === 'null') userId = null;

    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("file, is_public, user_id")
      .eq("id", id)
      .single();

    if (postError || !post?.file) {
      return res.status(404).json({ message: "Intelligence asset not found" });
    }

    // Privacy Check
    if (!post.is_public && String(post.user_id) !== String(userId)) {
      return res.status(403).json({ message: "Secure Asset: Authorization required" });
    }

    const fileUrl = post.file;
    const fileName = fileUrl.split("/").pop();

    console.log(`Downloading asset: ${fileName} from 'posts' bucket`);
    const { data, error: downloadError } = await supabase.storage
      .from("posts")
      .download(fileName);

    if (downloadError) throw downloadError;

    const buffer = Buffer.from(await data.arrayBuffer());
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", data.type);
    res.send(buffer);
  } catch (error) {
    console.error("Secure Retrieval Error:", error.message);
    res.status(500).json({ message: "Secure intelligence retrieval failed", error: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Fetch post to check for file
    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("file")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    // 2. Delete file from storage if it exists
    if (post?.file) {
      const fileName = post.file.split("/").pop();
      await supabase.storage.from("posts").remove([fileName]);
      console.log(`Removed asset from storage: ${fileName}`);
    }

    // 3. Delete from database
    const { error: dbError } = await supabase
      .from("posts")
      .delete()
      .eq("id", id);

    if (dbError) throw dbError;

    res.status(200).json({ message: "Intelligence node purged successfully" });
  } catch (error) {
    console.error("Purge Failed:", error.message);
    res.status(500).json({ message: "intelligence purge failed", detail: error.message });
  }
};

export const toggleLike = async (req, res) => {
  try {
    const { postId, userId } = req.body;
    if (!postId || !userId) return res.status(400).json({ message: "Post ID and User ID required" });

    // Check if like exists
    const { data: existingLike, error: fetchError } = await supabase
      .from("post_likes")
      .select("*")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .single();

    if (existingLike) {
      // Unlike
      const { error: deleteError } = await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userId);
      
      if (deleteError) throw deleteError;
      return res.status(200).json({ liked: false });
    } else {
      // Like
      const { error: insertError } = await supabase
        .from("post_likes")
        .insert([{ post_id: postId, user_id: userId }]);
      
      if (insertError) throw insertError;
      return res.status(200).json({ liked: true });
    }
  } catch (error) {
    console.error("Like Toggle Failed:", error.message);
    res.status(500).json({ message: "Failed to process like operation", error: error.message });
  }
};
