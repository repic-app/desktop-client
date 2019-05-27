import electron from 'electron'

const { getAPPData } = electron.remote.require('./storage')
let soundPlayer = null

export const presetSounds = {
  INSERT_PHOTO: {
    src: require('../assets/sounds/sound_insert_photo.mp3'),
    volume: 0.8
  },
  DONE: {
    src: require('../assets/sounds/sound_done.wav'),
    volume: 0.8
  },
  ERROR: {
    src: require('../assets/sounds/sound_error.wav'),
    volume: 0.1
  }
}

export const playSound = (sound) => {

  if (typeof sound === 'string') {
    sound = presetSounds[sound] || {}
  }

  const { src, volume } = sound
  const { soundEffects } = getAPPData('preferences')

  if (!src || !soundEffects) {
    return false
  }

  soundPlayer = soundPlayer || new Audio()
  soundPlayer.src = src
  soundPlayer.volume = volume
  soundPlayer.play()

}