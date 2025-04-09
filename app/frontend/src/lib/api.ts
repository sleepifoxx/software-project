import axios from "axios"

export const getPosts = async (limit = 8) => {
  const res = await axios.get(`http://localhost:8000/get-post?limit=${limit}`)
  return res.data
}
export const getPostImages = async (postId: number) => {
  const res = await axios.get(`http://localhost:8000/post-images?post_id=${postId}`)
  return res.data
}