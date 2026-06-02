-- Insert default users for testing
-- Password: 'password' (BCrypt hashed)

INSERT INTO users (full_name, email, phone_number, password, role, is_active, address, created_at, updated_at) 
VALUES 
  ('Priya Singh', 'admin@demo.com', '9876543211', '$2a$10$slYQmyNdGzin7olVB4itKOYvmPDManqC9ZrISLNQXi/FX2.KN5lkW', 'ADMIN', true, 'New Delhi, India', NOW(), NOW()),
  ('Amit Kumar', 'worker@demo.com', '9876543212', '$2a$10$slYQmyNdGzin7olVB4itKOYvmPDManqC9ZrISLNQXi/FX2.KN5lkW', 'WORKER', true, 'New Delhi, India', NOW(), NOW()),
  ('Rahul Sharma', 'citizen@demo.com', '9876543210', '$2a$10$slYQmyNdGzin7olVB4itKOYvmPDManqC9ZrISLNQXi/FX2.KN5lkW', 'CITIZEN', true, 'New Delhi, India', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
