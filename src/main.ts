import './reset.css'
import { Scene } from './scene'
import { SpinePlugin } from '@esotericsoftware/spine-phaser'

window.onload = () => {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    scale: {
      mode: Phaser.Scale.FIT,
      parent: '',
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 1280,
      height: 720
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 300 },
        debug: import.meta.env.PROD ? false : true
      }
    },
    plugins: {
      scene: [
        { key: 'spine.SpinePlugin', plugin: SpinePlugin, mapping: 'spine' }
      ]
    },
    scene: Scene
  }
  new Phaser.Game(config)
}
