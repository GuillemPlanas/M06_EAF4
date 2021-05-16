const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 1280,
  heigth: 720,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: {
    preload,
    create,
    update,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 700 },
    },
  }
};

const game = new Phaser.Game(config);
var limitador=0;
var score=0;
var orient=1;
var health=3;

function preload() {

  this.load.audio('ambient','assets/sounds/Musica.mp3');
  this.load.audio('throw','assets/sounds/throw.mp3');
  this.load.audio('explosion','assets/sounds/explosion.mp3');
  this.load.audio('saltar','assets/sounds/saltar.mp3');
  this.load.audio('reward','assets/sounds/reward.mp3');
  this.load.audio('bound','assets/sounds/bound.mp3');
  this.load.audio('extralife','assets/sounds/vida.mp3');

  this.load.image('bg_1','assets/images/Layers/Sky.png');
  this.load.image('bg_2','assets/images/Layers/BG_Decor.png');
  this.load.image('bg_3','assets/images/Layers/Middle_Decor.png');
  this.load.image('bg_4','assets/images/Layers/Foreground.png');
  this.load.image('bg_5','assets/images/Layers/Ground.png');

  this.load.image('tiles', 'assets/tilesets/platformPack_tilesheet.png');
  this.load.image('spike', 'assets/images/spike.png');
  this.load.image('aigua','assets/images/aigua.png');
  this.load.image('gla', 'assets/images/gla.png');
  this.load.image('cara', 'assets/images/cara.png');
  this.load.image('pedra','assets/images/pedra.png');

  this.load.tilemapTiledJSON('map', 'assets/tilemaps/level1.json');

  this.load.atlas('player', 'assets/images/lya_atlas.png','assets/images/lya_atlas.json');
  this.load.atlas('player_salt', 'assets/images/lya_salt_atlas.png','assets/images/lya_salt_atlas.json');
  this.load.atlas('player_throw', 'assets/images/lya_throw_atlas.png','assets/images/lya_throw_atlas.json');
  this.load.atlas('froggy', 'assets/images/froggy.png','assets/images/froggy.json');

  this.load.spritesheet('boom','assets/images/explosio.png',{ frameWidth: 150, frameHeight: 150 }); 
}

function create() {

  this.cameras.main.setBounds(0, 0, 9600, 1088);
  this.physics.world.setBounds(0, 0, 9600, 1088);

  ambientSnd = this.sound.add('ambient',{ volume: 0.5, loop: true });
  this.throw=this.sound.add('throw');
  this.saltar=this.sound.add('saltar',{volume:0.5});
  this.bound=this.sound.add('bound');
  this.reward=this.sound.add('reward');
  this.extralife=this.sound.add('extralife');
  this.explosion=this.sound.add('explosion',{volume:0.5});

  ambientSnd.play();

  this.anims.create({
    key: 'caminar',
    frames: this.anims.generateFrameNames('player'),
    frameRate: 20,
    repeat: -1
  });

  this.anims.create({
    key: 'idle',
    frames: [{ key: 'player', frame: 'Caminar3_pix.png'}],
    frameRate: 10,
  });

  this.anims.create({
    key: 'jump',
    frames: this.anims.generateFrameNames('player_salt'),
    frameRate: 4,
    repeat: -1
  });

  this.anims.create({
        key: 'throw',
        frames: this.anims.generateFrameNames('player_throw'),
        frameRate: 8
      });

  this.anims.create({
    key: 'atac',
    frames: this.anims.generateFrameNames('froggy'),
    frameRate: 10,
    repeat: -1,
    repeatDelay:1000
  });

  const map = this.make.tilemap({ key: 'map' });
  const tileset = map.addTilesetImage('kenney_simple_platformer', 'tiles');
  
  this.bg_1 = this.add.tileSprite(0, -300, game.config.width, game.config.height, "bg_1");
  this.bg_1.setOrigin(0,0);
  this.bg_1.setScale(1.3,1.3);
  this.bg_1.setScrollFactor(0);

  this.bg_2 = this.add.tileSprite(0, -250, game.config.width, game.config.height, "bg_2");
  this.bg_2.setOrigin(0,0);
  this.bg_2.setScale(1.3,1.3);
  this.bg_2.setScrollFactor(0);

  this.bg_3 = this.add.tileSprite(0, -250, game.config.width, game.config.height, "bg_3");
  this.bg_3.setOrigin(0,0);
  this.bg_3.setScale(1.3,1.3);
  this.bg_3.setScrollFactor(0);

  this.bg_4 = this.add.tileSprite(0, -250, game.config.width, game.config.height, "bg_4");
  this.bg_4.setOrigin(0,0);
  this.bg_4.setScale(1.3,1.3);
  this.bg_4.setScrollFactor(0);

  this.bg_5 = this.add.tileSprite(0, -250, game.config.width, game.config.height, "bg_5");
  this.bg_5.setOrigin(0,0);
  this.bg_5.setScale(1.3,1.3);
  this.bg_5.setScrollFactor(0);

  const platforms = map.createStaticLayer('Platforms', tileset, 0, 0);
  platforms.setCollisionByExclusion(-1, true);

  const plantes = map.createStaticLayer('Foreground', tileset, 0, 0);

  this.player = this.physics.add.sprite(50, 800, 'player');
  this.player.setBounce(0.1);
  this.player.setCollideWorldBounds(true);
  this.player.setScale(0.85,0.85);

  this.granotes = this.physics.add.group({
    allowGravity: false,
    immovable: true
  });
  const granotaObjects = map.getObjectLayer('Granotes')['objects'];
  granotaObjects.forEach(granotaObject => {
    const granota = this.granotes.create(granotaObject.x, granotaObject.y,'froggy').setOrigin(0, 0);
    granota.body.setSize(granota.width, granota.height).setOffset(0, 0);
    granota.play('atac',true);
  });

  this.spikes = this.physics.add.group({
    allowGravity: false,
    immovable: true
  });
  const spikeObjects = map.getObjectLayer('Spikes')['objects'];
  spikeObjects.forEach(spikeObject => {
    const spike = this.spikes.create(spikeObject.x, spikeObject.y - spikeObject.height, 'spike').setOrigin(0, 0);
    spike.body.setSize(spike.width, spike.height).setOffset(0, 0);
  });

  this.aigues = this.physics.add.group({
    allowGravity: false,
    immovable: true
  });
  const aiguaObjects = map.getObjectLayer('aigua')['objects'];
  aiguaObjects.forEach(aiguaObject => {
    const aigua = this.aigues.create(aiguaObject.x, aiguaObject.y - aiguaObject.height, 'aigua').setOrigin(0, 0);
    aigua.body.setSize(aigua.width, aigua.height).setOffset(0,0);
  });

  this.glans = this.physics.add.group({
   allowGravity: false,
   immovable: true
  });
  const glaObjects = map.getObjectLayer('Glans')['objects'];
  glaObjects.forEach(glaObject => {
    const gla = this.glans.create(glaObject.x, glaObject.y - glaObject.height, 'gla').setOrigin(0, 0);
    gla.body.setSize(gla.width, gla.height).setOffset(0,0);
  });

  this.vides = this.physics.add.group({
   allowGravity: false,
   immovable: true
  });
  const vidaObjects = map.getObjectLayer('Vides')['objects'];
  vidaObjects.forEach(vidaObject => {
    const vida = this.vides.create(vidaObject.x-15, vidaObject.y  - vidaObject.height, 'cara').setOrigin(0, 0);
    vida.body.setSize(vida.width, vida.height).setOffset(0,0);
    vida.setScale(0.7,0.7);
  });

  this.pedra=this.physics.add.sprite(0,0,'pedra');
  this.pedra.setVisible(false);
  this.pedra.setCollideWorldBounds(true);
  this.pedra.setBounce(0.5);

  this.canvi=this.add.sprite(0,0,'pedra');
  this.canvi.setVisible(false);

  const img_gla=this.add.image(45,48,'gla');
  img_gla.setScale(1.3,1.3);
  img_gla.setScrollFactor(0);
  var num_glans = this.glans.getLength();
  scoreText = this.add.text(75, 40,score+'/'+num_glans, { fontSize: '40px', fill: '#fff'});
  scoreText.setScrollFactor(0);

  const img_cara=this.add.image(1160,53,'cara');
  img_cara.setScrollFactor(0);
  videsText = this.add.text(1235, 40, health, { fontSize: '40px', fill: '#fff'});
  videsText.setScrollFactor(0);

  this.physics.add.collider(this.player, platforms);
  this.physics.add.collider(this.player, this.spikes, playerHit, null, this);
  this.physics.add.collider(this.player, this.aigues, playerHit, null, this);
  this.physics.add.collider(this.player, this.granotes, playerHit, null, this);

  this.physics.add.overlap(this.player, this.glans, collectGla, null, this);
  this.physics.add.overlap(this.player, this.vides, collectVida, null, this);

  this.physics.add.collider(this.pedra, this.granotes, mataEnemic, null, this);
  this.physics.add.collider(this.pedra,platforms)

  this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
  this.cursors = this.input.keyboard.createCursorKeys();
}
function update() {
  if (this.cursors.left.isDown) {
    orient=0;
    this.player.setVelocityX(-300);
    if (this.player.body.onFloor()) {
      this.player.play('caminar', true);
    }
  } else if (this.cursors.right.isDown) {
    orient=1;
    this.player.setVelocityX(300);
    if (this.player.body.onFloor()) {
      this.player.play('caminar', true);
    }
  } else if (this.cursors.space.isDown) {
      if(limitador==0){
        limitador=1;
        this.player.play('throw',true);
        this.throw.play();
        this.pedra.setVisible(true);
        this.pedra.setX(this.player.body.position.x);
        this.pedra.setY(this.player.body.position.y);
        if(orient==1){
          this.pedra.setVelocity(800,1);
        }
        else {
          this.pedra.setVelocity(-800,1);
        }
        this.delay=this.time.delayedCall(2000, pedraKill, null, this);
      }
  } else {
    this.player.setVelocityX(0);
    if (this.player.body.onFloor()) {
      this.player.play('idle', true);
    }
  }
  if ((this.cursors.up.isDown) && this.player.body.onFloor()) {
    this.player.setVelocityY(-550);
    this.player.play('jump', true);
    this.saltar.play();
  }
  if (this.player.body.velocity.x > 0) {
    this.player.setFlipX(false);
  } else if (this.player.body.velocity.x < 0) {
    this.player.setFlipX(true);
  }

  this.bg_1.tilePositionX = this.cameras.main.scrollX * .1;
  this.bg_2.tilePositionX = this.cameras.main.scrollX * .2;
  this.bg_3.tilePositionX = this.cameras.main.scrollX * .3;
  this.bg_4.tilePositionX = this.cameras.main.scrollX * 0.5;
  this.bg_5.tilePositionX = this.cameras.main.scrollX * 0.8;

  this.bg_1.tilePositionY = this.cameras.main.scrollY * .1;
  this.bg_2.tilePositionY = this.cameras.main.scrollY * .2;
  this.bg_3.tilePositionY = this.cameras.main.scrollY * .3;
  this.bg_4.tilePositionY = this.cameras.main.scrollY * 0.5;
  this.bg_5.tilePositionY = this.cameras.main.scrollY * 0.8;
}

function pedraKill(pedra, canvi){
  this.pedra.setVisible(false);
  this.canvi.setVisible(false);
  limitador=0;
} 

function playerHit(player, spike, aigua, granota) {

  this.bound.play();
  
  health-=1;
  videsText.setText(health);
  this.cameras.main.flash();
  this.cameras.main.shake(300,0.005);
  player.setVelocity(0, 0);
  player.setX(50);
  player.setY(800);
  player.play('idle', true);
  player.setAlpha(0);

  let tw = this.tweens.add({
    targets: player,
    alpha: 1,
    duration: 150,
    ease: 'Linear',
    repeat: 5,
  });
}

function collectGla (player, gla)
{
  this.reward.play();

  gla.disableBody(true, true);

  score += 1;
  var num_glans = this.glans.getLength();
  scoreText.setText(score+'/'+num_glans);
}

function collectVida (player, vida)
{
  this.extralife.play();

  vida.disableBody(true, true);

  health += 1;
  videsText.setText(health);
}

function mataEnemic (pedra, granota, canvi)
{
  this.explosion.play();

  pedra.setVelocity(0,0);
  this.delay2=this.time.delayedCall(200, pedraKill, null, this);
  granota.disableBody(true,true);
  this.anims.create({
    key: 'explosio',
    frames: this.anims.generateFrameNames('boom'),
    frameRate: 10,
  });
  this.canvi.setVisible(true);
  this.canvi.setX(granota.body.position.x);
  this.canvi.setY(granota.body.position.y);
  this.canvi.play('explosio',true);
}

