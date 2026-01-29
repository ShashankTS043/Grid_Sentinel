class GridState:
    def __init__(self):
        # The main transformer load (The Source)
        self.transformer_current = 0.0
        
        # A dictionary to store downstream meters (House 1, House 2...)
        # Key = Sensor ID, Value = Current (Amps)
        self.smart_meters = {}
        
        # Configuration: How much mismatch is allowed before flagging theft?
        self.THEFT_THRESHOLD = 2.0  # Amps

    def update_transformer(self, current: float):
        self.transformer_current = current

    def update_meter(self, meter_id: str, current: float):
        self.smart_meters[meter_id] = current

    def check_for_theft(self) -> float:
        """
        Calculates the missing current.
        Returns the stolen amount in Amps.
        """
        total_consumption = sum(self.smart_meters.values())
        
        # Loss = Input - Output
        loss = self.transformer_current - total_consumption
        
        # If loss is negative, it just means sensors are slightly off (noise)
        if loss < 0:
            return 0.0
            
        return round(loss, 2)

# Create a single global instance
grid_state = GridState()