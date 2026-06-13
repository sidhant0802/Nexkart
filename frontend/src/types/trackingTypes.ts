export interface TrackingEvent {
  status:      string;
  description: string;
  location?:   string;
  timestamp:   string;
}

export interface PickupLocation {
  address: string;
  city:    string;
  state:   string;
  pinCode: string;
}

export interface Tracking {
  _id:               string;
  order:             string;
  carrier:           string;
  trackingNumber:    string;
  pickupLocation:    PickupLocation;
  estimatedDelivery: string;
  currentStatus:     string;
  currentLocation:   string;
  events:            TrackingEvent[];
  notes?:            string;
}