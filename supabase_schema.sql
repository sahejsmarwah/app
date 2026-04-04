-- Create services table
CREATE TABLE services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  deposit_amount INTEGER NOT NULL,
  description TEXT
);

-- Insert initial services
INSERT INTO services (id, name, price, deposit_amount, description) VALUES
('bridal', 'Bridal Artistry', 15000, 2000, 'Dream bridal look, perfected'),
('event', 'Events & Editorial', 8500, 1500, 'Photo-ready finishes'),
('consult', 'Consultation', 4500, 500, 'Detailed skin analysis');

-- Create bookings table
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  service_id TEXT REFERENCES services(id),
  booking_date DATE NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending', -- pending, confirmed, completed, cancelled
  payment_status TEXT DEFAULT 'unpaid', -- unpaid, partial, paid
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create availability table
CREATE TABLE availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blocked_date DATE NOT NULL UNIQUE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

-- Allow public read access to services
CREATE POLICY "Allow public read services" ON services FOR SELECT USING (true);

-- Allow public to create bookings
CREATE POLICY "Allow public create bookings" ON bookings FOR INSERT WITH CHECK (true);

-- Allow admins (using service role or specific email) to manage everything
-- (For simplicity in this step, we'll assume the admin uses the Supabase Dashboard or a Service Role Key)
