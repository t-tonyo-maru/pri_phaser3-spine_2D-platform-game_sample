// vite.config.js
export default {
  base:
    process.env.NODE_ENV === 'production'
      ? '/pub_web_phaser3-spine_2D-platform-game_sample/'
      : '/',
  build: {
    chunkSizeWarningLimit: 2200
  }
}
