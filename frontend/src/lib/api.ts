import axios from "axios"


export const getPosts = async (limit: number, offset: number) => {
  const res = await axios.get(`http://localhost:8000/get-list-of-posts?limit=${limit}&offset=${offset}`)
  return res.data
}

export const getPostImages = async (postId: number) => {
  console.log(postId)
  const res = await axios.get(`http://localhost:8000/get-post-images/${postId}`)
  return res.data
}

export const signup = async (email: string, password: string, contact_number?: string, full_name?: string) => {
  console.log("Signup called from API") // ✅ để kiểm tra
  const res = await axios.post("http://localhost:8000/signup", null, {
    params: { email, password, contact_number, full_name },
  })
  return res.data
}

export const login = async (email: string, password: string) => {
  const res = await axios.get("http://localhost:8000/login", {
    params: {
      email,
      password,
    },
  })
  return res.data
}


// New functions for additional endpoints

export const getPostById = async (postId: number) => {
  const res = await axios.get(`http://localhost:8000/get-post-by-id`, {
    params: { post_id: postId }
  })
  return res.data
}

export const getPostsByUser = async (userId: number) => {
  const res = await axios.get(`http://localhost:8000/get-posts-by-user`, {
    params: { user_id: userId }
  })
  return res.data
}

export const createPost = async (formData: FormData) => {
  const res = await axios.post("http://localhost:8000/create-post", formData)

  return res.data
}

export const updatePost = async (postId: number, postData: any) => {
  const res = await axios.put(`http://localhost:8000/update-post/${postId}`, null, {
    params: postData
  })
  return res.data
}

export const deletePost = async (postId: number) => {
  const res = await axios.delete(`http://localhost:8000/delete-post/${postId}`)
  return res.data
}

export const addComment = async (postId: number, userId: number, rating: number, comment?: string) => {
  const res = await axios.post(`http://localhost:8000/add-comment`, null, {
    params: { post_id: postId, user_id: userId, rating, comment }
  })
  return res.data
}

export const getPostComments = async (postId: number) => {
  const res = await axios.get(`http://localhost:8000/get-post-comments/${postId}`)
  return res.data
}

export const addToFavorites = async (userId: number, postId: number) => {
  console.log("da them vao danh sach yeu thich")
  const res = await axios.post("http://localhost:8000/add-favourite", null, {
    params: { user_id: userId, post_id: postId }
  })
  return res.data
}

export const getUserFavorites = async (userId: number) => {
  const res = await axios.get(`http://localhost:8000/get-user-favourites/${userId}`)
  return res.data
}

export const removeFavorite = async (userId: number, postId: number) => {
  const res = await axios.delete("http://localhost:8000/remove-favourite", {
    params: { user_id: userId, post_id: postId }
  })
  return res.data
}

export const getUserInfo = async (userId: number) => {
  const res = await axios.get("http://localhost:8000/get-user-info", {
    params: { user_id: userId }
  })
  return res.data
}

export const updateUserInfo = async (userId: number, userData: any) => {
  const res = await axios.put("http://localhost:8000/update-user", null, {
    params: { user_id: userId, ...userData }
  })
  return res.data
}

export const addPostImage = async (postId: number, imageUrl: string) => {
  const res = await axios.post("http://localhost:8000/add-post-image", {
    post_id: postId,
    image_url: imageUrl
  });
  return res.data;
};

export const addPostImages = async (postId: number, files: File[]) => {
  const form = new FormData();
  form.append("post_id", String(postId));
  files.forEach((file) => {
    form.append("images", file);
  });

  const res = await axios.post("http://localhost:8000/add-post-images", form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  });

  return res.data;
};


export const addToHistory = async (userId: number, postId: number) => {
  const res = await axios.post("http://localhost:8000/add-history", null, {
    params: { user_id: userId, post_id: postId }
  })
  return res.data
}

export const getUserHistory = async (userId: number, limit = 10) => {
  const res = await axios.get(`http://localhost:8000/get-user-history/${userId}`, {
    params: { limit }
  })
  return res.data
}

export const getPostsWithFilters = async (filters: any) => {
  const res = await axios.get("http://localhost:8000/get-posts-by-filter", {
    params: filters
  })
  return res.data
}

export const addConvenience = async (
  postId: number,
  conveniences: {
    wifi?: boolean,
    air_conditioner?: boolean,
    fridge?: boolean,
    washing_machine?: boolean,
    parking_lot?: boolean,
    security?: boolean,
    kitchen?: boolean,
    private_bathroom?: boolean,
    furniture?: boolean,
    bacony?: boolean,
    elevator?: boolean,
    pet_allowed?: boolean
  }
) => {
  try {
    const res = await axios.post("http://localhost:8000/add-convenience", null, {
      params: {
        post_id: postId,
        ...conveniences
      }
    })
    return res.data
  } catch (error: any) {
    console.error("Error adding convenience:", error)
    return {
      status: "fail",
      message: error.response?.data?.message || "Failed to add convenience information"
    }
  }
}

export const searchPosts = async (params: {
  district?: string
  min_price: number
  max_price: number
  area_min?: number
  area_max?: number
  type?: string
  limit?: number
  offset?: number
}) => {
  console.log("Gọi API searchPosts với:", params)

  const res = await axios.get("http://localhost:8000/search-posts", {
    params,
  })

  return res.data
}