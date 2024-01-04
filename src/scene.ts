import Phaser from 'phaser'
import 'phaser/plugins/spine/dist/SpinePlugin'
import * as Spine from '@esotericsoftware/spine-phaser'

const SCENE_KEY = 'spine-2d-platform-game_scene'
// scene に読み込む画像等のルートパス
const ASSETS_URL = import.meta.env.PROD
  ? '/pub_web_phaser3-spine_2D-platform-game_sample/assets'
  : '/assets'

export class Scene extends Phaser.Scene {
  platforms: Phaser.Physics.Arcade.StaticGroup | null
  cursors: Phaser.Types.Input.Keyboard.CursorKeys | null
  spineBoyPlayer: Spine.SpineGameObject | null
  spineGhost: Spine.SpineGameObject | null

  constructor() {
    super({ key: SCENE_KEY })
    this.platforms = null
    this.cursors = null
    this.spineBoyPlayer = null
    this.spineGhost = null
  }

  preload = () => {
    this.load.image('ground', `${ASSETS_URL}/platform-ground.jpg`)

    this.load.image('bg-planet', `${ASSETS_URL}/bg-planet.jpg`)
    this.load.image('bg-rook', `${ASSETS_URL}/bg-rook.png`)

    this.load.spineJson(
      'spine-ghost-model',
      `${ASSETS_URL}/spine/ghost/model.json`
    )
    this.load.spineAtlas(
      'spine-ghost-atlas',
      `${ASSETS_URL}/spine/ghost/model.atlas`
    )

    this.load.spineJson(
      'spine-boy-model',
      `${ASSETS_URL}/spine/boy/spineboy-pro.json`
    )
    this.load.spineAtlas(
      'spine-boy-atlas',
      `${ASSETS_URL}/spine/boy/spineboy-pro.atlas`
    )
  }

  create = () => {
    // ステージ
    const stage = {
      x: 0,
      y: 0,
      width: this.scale.width * 3,
      height: this.scale.height
    } as const

    // 背景
    const sky = {
      x: this.scale.width * 0.5,
      y: this.scale.height * 0.5,
      imageName: 'bg-planet',
      moveSize: 0
    } as const
    // 背景を追加
    this.add
      .image(sky.x, sky.y, sky.imageName)
      // 背景を動かないようにする
      .setScrollFactor(sky.moveSize)

    // 岩の情報
    const rock = {
      x: 800,
      y: this.scale.height,
      imageName: 'bg-rook',
      coefficientX: 0,
      coefficientY: 1,
      moveSize: 0.25
    } as const
    // 岩(1つ目)を追加
    this.add
      .image(rock.x * 0, rock.y, rock.imageName)
      // 岩の位置を調整
      .setOrigin(rock.coefficientX, rock.coefficientY)
      // 岩の移動量を調整
      .setScrollFactor(rock.moveSize)
    // 岩(2つ目)を追加
    this.add
      .image(rock.x * 1, rock.y, rock.imageName)
      .setOrigin(rock.coefficientX, rock.coefficientY)
      .setScrollFactor(rock.moveSize)
    // 岩(3つ目)を追加
    this.add
      .image(rock.x * 2, rock.y, rock.imageName)
      .setOrigin(rock.coefficientX, rock.coefficientY)
      .setScrollFactor(rock.moveSize)

    // 地面を静的オブジェクトとして生成
    this.platforms = this.physics.add.staticGroup()
    // 地面の追加
    this.platforms.create(
      this.scale.width * 0.5,
      this.scale.height + 40,
      'ground'
    )
    this.platforms.create(
      this.scale.width * 1.5,
      this.scale.height + 40,
      'ground'
    )
    this.platforms.create(
      this.scale.width * 2.5,
      this.scale.height + 40,
      'ground'
    )

    // Spine お化け キャラクターの追加
    this.spineGhost = this.add.spine(
      500, // x
      550, // y
      'spine-ghost-model', // json
      'spine-ghost-atlas' // atlas
    )
    this.spineGhost.scale = 0.5 // スケール
    this.spineGhost.setInteractive() // インタラクション可
    this.physics.add.existing(this.spineGhost)
    if (this.spineGhost.body instanceof Phaser.Physics.Arcade.Body) {
      // 弾性を調整
      this.spineGhost.body.setBounce(0.2)
      this.spineGhost.body.setCollideWorldBounds(true)
      this.spineGhost.body.setOffset(0, 0)
    }
    this.input.enableDebug(this.spineGhost, 0xff00ff) // デバッグON
    this.spineGhost.animationState.setAnimation(0, 'idle', true) // idle アニメーションをセット

    // Spine プレイキャラクターの追加
    this.spineBoyPlayer = this.add.spine(
      100,
      550,
      'spine-boy-model',
      'spine-boy-atlas'
    )
    this.spineBoyPlayer.scale = 0.4
    this.spineBoyPlayer.setInteractive()
    this.physics.add.existing(this.spineBoyPlayer)
    if (this.spineBoyPlayer.body instanceof Phaser.Physics.Arcade.Body) {
      this.spineBoyPlayer.body.setBounce(0.2)
      this.spineBoyPlayer.body.setCollideWorldBounds(true)
      this.spineBoyPlayer.body.setOffset(0, 0)
    }
    this.input.enableDebug(this.spineBoyPlayer, 0xff00ff) // デバッグON
    this.spineBoyPlayer.animationState.setAnimation(0, 'idle', true)

    // Spine アニメーションにコールバックを設定する
    this.spineBoyPlayer.animationState.addListener({
      // start: (entry) => {},
      // end: (entry) => {},
      // interrupt: (entry) => {},
      // dispose: (entry) => {},
      complete: (entry) => {
        // track:1 の shoot が再生された後に空アニメーションをする
        if (entry.animation?.name === 'shoot') {
          this.spineBoyPlayer!.animationState.setEmptyAnimation(1)
        }
      }
      // event: (entry) => {}
    })

    // キーボード操作ON
    this.cursors = this.input.keyboard!.createCursorKeys()

    // 当たり判定を設定
    this.physics.add.collider(
      [this.spineBoyPlayer, this.spineGhost],
      this.platforms
    )
    this.physics.add.collider([this.spineGhost], this.spineBoyPlayer)

    // メインカメラがプレイヤーを追随
    this.cameras.main.startFollow(this.spineBoyPlayer)

    // メインカメラの範囲を設定
    this.cameras.main.setBounds(stage.x, stage.y, stage.width, stage.height)

    // ステージの境界を設定
    this.physics.world.setBounds(stage.x, stage.y, stage.width, stage.height)
  }

  update = () => {
    if (!this.spineBoyPlayer) return
    if (!this.cursors) return

    const moveSpeed = 320 // 移動量

    // 左矢印キー押下:
    if (this.cursors.left.isDown) {
      // 左矢印キー押下時: 速度はマイナス
      if (this.spineBoyPlayer.body instanceof Phaser.Physics.Arcade.Body) {
        this.spineBoyPlayer.body.setVelocityX(moveSpeed * -1)
      }
      // Spine boy のアニメーションを run に更新
      if (
        this.spineBoyPlayer.animationState.getCurrent(0)?.animation?.name !==
        'run'
      ) {
        // FIXME: this.spineBoyPlayer.setFlipX(true) では反転できず
        // Spine boy を反転
        this.spineBoyPlayer.scaleX =
          this.spineBoyPlayer.scaleX > 0
            ? this.spineBoyPlayer.scaleX * -1
            : this.spineBoyPlayer.scaleX * 1
        this.spineBoyPlayer.animationState.setAnimation(0, 'run', true)
      }
    }
    // 右矢印キー押下:
    else if (this.cursors.right.isDown) {
      // 右矢印キー押下時: 速度はプラス
      if (this.spineBoyPlayer.body instanceof Phaser.Physics.Arcade.Body) {
        this.spineBoyPlayer.body.setVelocityX(moveSpeed)
      }
      // Spine boy のアニメーションを run に更新
      if (
        this.spineBoyPlayer.animationState.getCurrent(0)?.animation?.name !==
        'run'
      ) {
        // FIXME: this.spineBoyPlayer.setFlipX(false) では反転できず
        // Spine boy を反転
        this.spineBoyPlayer.scaleX =
          this.spineBoyPlayer.scaleX > 0
            ? this.spineBoyPlayer.scaleX * 1
            : this.spineBoyPlayer.scaleX * -1
        this.spineBoyPlayer.animationState.setAnimation(0, 'run', true)
      }
    }
    // 矢印キーが押下されていない時:
    else {
      // 矢印キーが押下されていないなら: 速度は 0
      if (this.spineBoyPlayer.body instanceof Phaser.Physics.Arcade.Body) {
        this.spineBoyPlayer.body.setVelocityX(0)
      }
      // Spine boy のアニメーションを idle に更新
      if (
        this.spineBoyPlayer.animationState.getCurrent(0)?.animation?.name !==
        'idle'
      ) {
        this.spineBoyPlayer.animationState.setAnimation(0, 'idle', true)
      }
    }

    // スペースキー押下:
    if (
      this.cursors.space.isDown &&
      this.spineBoyPlayer.body instanceof Phaser.Physics.Arcade.Body
    ) {
      // Spine boy の shoot アニメーションを発火させる
      if (
        this.spineBoyPlayer.animationState.getCurrent(1)?.animation?.name !==
        'shoot'
      ) {
        this.spineBoyPlayer.animationState.setAnimation(1, 'shoot', false)
      }
    }
  }
}
