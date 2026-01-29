import numpy as np
from scipy.fft import fft

class AudioAnalyzer:
    def __init__(self, sample_rate=1000):
        # We assume the ESP32 sends 1000 data points per second (1kHz)
        self.sample_rate = sample_rate

    def analyze_health(self, waveform):
        """
        Returns a 'Distortion Score'.
        0.0 = Pure Sine Wave (Healthy)
        1.0+ = Noisy/Distorted (Critical)
        """
        if not waveform or len(waveform) < 10:
            return 0.0

        # 1. Convert List to Numpy Array
        data = np.array(waveform)
        N = len(data)

        # 2. Perform FFT (The Magic)
        # This converts "Time" data into "Frequency" data
        fft_values = fft(data)
        
        # Get the magnitude of each frequency
        magnitudes = np.abs(fft_values)[:N//2]
        
        # 3. Analyze the Spectrum
        # Find the loudest frequency (Peak)
        peak_index = np.argmax(magnitudes)
        
        # Calculate "Total Energy" vs "Peak Energy"
        total_energy = np.sum(magnitudes)
        peak_energy = magnitudes[peak_index]
        
        # If the Peak (50Hz) accounts for most of the energy, it's clean.
        # If there is energy spread everywhere (Noise), this ratio drops.
        
        if total_energy == 0: return 0.0
        
        # Noise Ratio: How much sound is NOT the main hum?
        noise_ratio = 1.0 - (peak_energy / total_energy)
        
        # Make the score easier to read (0 to 10 scale)
        distortion_score = round(noise_ratio * 10, 2)
        
        return distortion_score

audio_engine = AudioAnalyzer()