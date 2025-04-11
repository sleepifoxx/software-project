import axios from "axios"

const API_BASE_URL = "http://localhost:8000"

export async function getPosts(limit = 8, offset = 0) {
  const res = await fetch(`${API_BASE_URL}/get-list-of-posts?limit=${limit}`)
  return await res.json()
}

export const getPostImages = async (postId: number) => {
  const res = await axios.get(`${API_BASE_URL}/get-post-images/${postId}`)
  return res.data
}

export const signup = async (email: string, password: string, contact_number: string, full_name: string) => {
  const res = await axios.post(`${API_BASE_URL}/signup`, null, {
    params: { email, password, contact_number, full_name },
  })
  return res.data
}

export const login = async (email: string, password: string) => {
  const res = await axios.get(`${API_BASE_URL}/login`, {
    params: {
      email,
      password,
    },
  })
  return res.data
}

export async function searchPosts(
  province?: string,
  district?: string,
  rural?: string,
  min_price?: number,
  max_price?: number,
  type?: string,
  room_num?: number,
  limit = 10,
  offset = 0
) {
  const res = await axios.get(`${API_BASE_URL}/search-posts`, {
    params: { 
      province,
      district,
      rural,
      min_price,
      max_price,
      type,
      room_num,
      limit,
      offset
    }
  })
  return res.data
}

// User endpoints
export const getUserInfo = async (user_id: number) => {
  const res = await axios.get(`${API_BASE_URL}/get-user-info`, {
    params: { user_id }
  })
  return res.data
}

export const updateUser = async (
  user_id: number,
  email: string,
  password: string,
  contact_number: string,
  full_name: string,
  avatar_url?: string,
  address?: string,
  gender?: string,
  birthday?: string
) => {
  const res = await axios.put(`${API_BASE_URL}/update-user`, null, {
    params: { 
      user_id, 
      email, 
      password, 
      contact_number, 
      full_name, 
      avatar_url, 
      address, 
      gender, 
      birthday 
    }
  })
  return res.data
}

export const listUsers = async (limit = 10, offset = 0) => {
  const res = await axios.get(`${API_BASE_URL}/list-users`, {
    params: { limit, offset }
  })
  return res.data
}

export const deleteUser = async (user_id: number) => {
  const res = await axios.delete(`${API_BASE_URL}/delete-user/${user_id}`)
  return res.data
}

// Post endpoints
export const getPostsByUser = async (user_id: number) => {
  const res = await axios.get(`${API_BASE_URL}/get-posts-by-user`, {
    params: { user_id }
  })
  return res.data
}

export const getPostById = async (post_id: number) => {
  const res = await axios.get(`${API_BASE_URL}/get-post-by-id`, {
    params: { post_id }
  })
  return res.data
}

export const createPost = async (
  user_id: number,
  title: string,
  description: string,
  price: number,
  type: string,
  deposit: number,
  electricity_fee: number,
  water_fee: number,
  internet_fee: number,
  vehicle_fee: number,
  province: string,
  district: string,
  rural: string,
  street: string,
  room_num?: number,
  floor_num?: string,
  detailed_address?: string
) => {
  const res = await axios.post(`${API_BASE_URL}/create-post`, null, {
    params: {
      user_id,
      title,
      description,
      price,
      type,
      deposit,
      electricity_fee,
      water_fee,
      internet_fee,
      vehicle_fee,
      province,
      district,
      rural,
      street,
      room_num,
      floor_num,
      detailed_address
    }
  })
  return res.data
}

export const updatePost = async (
  post_id: number,
  title: string,
  description: string,
  price: number,
  type: string,
  deposit: number,
  electricity_fee: number,
  water_fee: number,
  internet_fee: number,
  vehicle_fee: number,
  province: string,
  district: string,
  rural: string,
  street: string,
  room_num?: number,
  floor_num?: string,
  detailed_address?: string
) => {
  const res = await axios.put(`${API_BASE_URL}/update-post/${post_id}`, null, {
    params: {
      title,
      description,
      price,
      type,
      deposit,
      electricity_fee,
      water_fee,
      internet_fee,
      vehicle_fee,
      province,
      district,
      rural,
      street,
      room_num,
      floor_num,
      detailed_address
    }
  })
  return res.data
}

export const deletePost = async (post_id: number) => {
  const res = await axios.delete(`${API_BASE_URL}/delete-post/${post_id}`)
  return res.data
}

// Comments endpoints
export const addComment = async (post_id: number, user_id: number, rating: number, comment?: string) => {
  const res = await axios.post(`${API_BASE_URL}/add-comment`, null, {
    params: { post_id, user_id, rating, comment }
  })
  return res.data
}

export const getPostComments = async (post_id: number) => {
  const res = await axios.get(`${API_BASE_URL}/get-post-comments/${post_id}`)
  return res.data
}

export const updateComment = async (comment_id: number, rating: number, comment?: string) => {
  const res = await axios.put(`${API_BASE_URL}/update-comment/${comment_id}`, null, {
    params: { rating, comment }
  })
  return res.data
}

export const deleteComment = async (comment_id: number) => {
  const res = await axios.delete(`${API_BASE_URL}/delete-comment/${comment_id}`)
  return res.data
}

// Favourites endpoints
export const addFavourite = async (user_id: number, post_id: number) => {
  const res = await axios.post(`${API_BASE_URL}/add-favourite`, null, {
    params: { user_id, post_id }
  })
  return res.data
}

export const getUserFavourites = async (user_id: number) => {
  const res = await axios.get(`${API_BASE_URL}/get-user-favourites/${user_id}`)
  return res.data
}

export const removeFavourite = async (user_id: number, post_id: number) => {
  const res = await axios.delete(`${API_BASE_URL}/remove-favourite`, {
    params: { user_id, post_id }
  })
  return res.data
}

// History endpoints
export const addHistory = async (user_id: number, post_id: number) => {
  const res = await axios.post(`${API_BASE_URL}/add-history`, null, {
    params: { user_id, post_id }
  })
  return res.data
}

export const getUserHistory = async (user_id: number, limit = 10) => {
  const res = await axios.get(`${API_BASE_URL}/get-user-history/${user_id}`, {
    params: { limit }
  })
  return res.data
}

export const clearUserHistory = async (user_id: number) => {
  const res = await axios.delete(`${API_BASE_URL}/clear-user-history/${user_id}`)
  return res.data
}

// Convenience endpoints
export const addConvenience = async (
  post_id: number,
  wifi: boolean = false,
  air_conditioner: boolean = false,
  fridge: boolean = false,
  washing_machine: boolean = false,
  parking_lot: boolean = false,
  security: boolean = false,
  kitchen: boolean = false,
  private_bathroom: boolean = false,
  furniture: boolean = false,
  bacony: boolean = false,
  elevator: boolean = false,
  pet_allowed: boolean = false
) => {
  const res = await axios.post(`${API_BASE_URL}/add-convenience`, null, {
    params: {
      post_id,
      wifi,
      air_conditioner,
      fridge,
      washing_machine,
      parking_lot,
      security,
      kitchen,
      private_bathroom,
      furniture,
      bacony,
      elevator,
      pet_allowed
    }
  })
  return res.data
}

export const getPostConvenience = async (post_id: number) => {
  const res = await axios.get(`${API_BASE_URL}/get-post-convenience/${post_id}`)
  return res.data
}

export const updateConvenience = async (
  post_id: number,
  wifi: boolean = false,
  air_conditioner: boolean = false,
  fridge: boolean = false,
  washing_machine: boolean = false,
  parking_lot: boolean = false,
  security: boolean = false,
  kitchen: boolean = false,
  private_bathroom: boolean = false,
  furniture: boolean = false,
  bacony: boolean = false,
  elevator: boolean = false,
  pet_allowed: boolean = false
) => {
  const res = await axios.put(`${API_BASE_URL}/update-convenience/${post_id}`, null, {
    params: {
      wifi,
      air_conditioner,
      fridge,
      washing_machine,
      parking_lot,
      security,
      kitchen,
      private_bathroom,
      furniture,
      bacony,
      elevator,
      pet_allowed
    }
  })
  return res.data
}

export const deleteConvenience = async (post_id: number) => {
  const res = await axios.delete(`${API_BASE_URL}/delete-convenience/${post_id}`)
  return res.data
}

// Post images endpoints
export const addPostImage = async (post_id: number, image_url: string) => {
  const res = await axios.post(`${API_BASE_URL}/add-post-image`, null, {
    params: { post_id, image_url }
  })
  return res.data
}

export const deletePostImage = async (image_id: number) => {
  const res = await axios.delete(`${API_BASE_URL}/delete-post-image/${image_id}`)
  return res.data
}