import axios from "axios"

export async function getPosts(limit = 8, offset = 0) {
  const res = await fetch(`http://localhost:8000/get-post?limit=${limit}&offset=${offset}`)
  return await res.json()
}


export const getPostImages = async (postId: number) => {
  const res = await axios.get(`http://localhost:8000/post-images?post_id=${postId}`)
  return res.data
}

export const signup = async (username: string, password: string) => {
  console.log("Signup called from API") // ✅ để kiểm tra
  const res = await axios.post("http://localhost:8000/check_signup", null, {
    params: { username, password },
  })
  return res.data
}
export const login = async (username: string, password: string) => {
  const res = await axios.get("http://localhost:8000/check_login", {
    params: {
      username,
      password,
    },
  })
  return res.data
}
