import numpy as np
from sklearn.linear_model import LinearRegression

class Predictor:
    def __init__(self):
        # We need to store history to train the model on the fly
        # X = Time (seconds), Y = Temperature
        self.history_x = []
        self.history_y = []
        self.MAX_HISTORY = 60  # Keep last 60 seconds of data

        # The AI Model
        self.model = LinearRegression()

    def add_reading(self, temp: float, timestamp_sec: float):
        """
        Add a new data point to the training set.
        """
        self.history_x.append([timestamp_sec]) # Scikit needs 2D array
        self.history_y.append(temp)

        # Keep buffer small (sliding window)
        if len(self.history_x) > self.MAX_HISTORY:
            self.history_x.pop(0)
            self.history_y.pop(0)

    def predict_failure_time(self, limit_temp=100.0):
        """
        Predicts how many minutes until we hit the 'limit_temp'.
        Returns: Minutes (float) or None (if safe).
        """
        # We need at least 10 points to make a decent guess
        if len(self.history_x) < 10:
            return None

        # 1. Train the Model (Real-time Learning)
        self.model.fit(self.history_x, self.history_y)

        # 2. Get the Slope (Rate of Change)
        slope = self.model.coef_[0]
        intercept = self.model.intercept_

        # If slope is negative or zero, we are cooling down (Safe)
        if slope <= 0:
            return None

        # 3. Solve for Time: Y = mX + c  ->  X = (Y - c) / m
        # predicted_time = (Target_Temp - Intercept) / Slope
        current_time = self.history_x[-1][0]
        predicted_timestamp = (limit_temp - intercept) / slope
        
        seconds_left = predicted_timestamp - current_time

        # If prediction is too far in future (> 1 hour), ignore it
        if seconds_left > 3600 or seconds_left < 0:
            return None

        return round(seconds_left / 60.0, 1) # Return minutes

# Global Instance
oracle = Predictor()