export function playSound(type: 'focusEnd' | 'breakEnd', volume: number = 0.5): void {
  if (typeof window === 'undefined') return
  
  try {
    const audioContext = new AudioContext()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    if (type === 'focusEnd') {
      oscillator.frequency.value = 587.33
      oscillator.type = 'sine'
    } else {
      oscillator.frequency.value = 440
      oscillator.type = 'sine'
    }
    
    gainNode.gain.value = volume
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  } catch (error) {
    console.error('Failed to play sound:', error)
  }
}
