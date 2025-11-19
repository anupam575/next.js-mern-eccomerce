/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "res.cloudinary.com", // अगर Cloudinary यूज़ हो रहा है
      "api.example.com",     // आपकी API domain (इसको बदलें)
      "lh3.googleusercontent.com", // Google avatar URLs
      "avatars.githubusercontent.com" // GitHub avatar URLs
    ],
  },
};

export default nextConfig;
