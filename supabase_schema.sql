-- Create tables

-- 1. Profiles Table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  reg_number TEXT,
  role TEXT CHECK (role IN ('student', 'staff', 'admin')) DEFAULT 'student',
  department_id UUID, -- For staff (which department they manage)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Departments Table
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Clearance Requests Table (Students initiate this)
CREATE TABLE IF NOT EXISTS public.clearance_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'completed')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Clearance Status Table (Tracks each department's approval for a request)
CREATE TABLE IF NOT EXISTS public.clearance_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES public.clearance_requests(id) ON DELETE CASCADE NOT NULL,
  department_id UUID REFERENCES public.departments(id) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  comments TEXT,
  approved_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(request_id, department_id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clearance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clearance_status ENABLE ROW LEVEL SECURITY;

-- Policies

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Departments
CREATE POLICY "Departments are viewable by everyone" 
ON public.departments FOR SELECT USING (true);

-- Clearance Requests
CREATE POLICY "Students can view their own requests" 
ON public.clearance_requests FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Staff can view all requests" 
ON public.clearance_requests FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin')));

CREATE POLICY "Students can create requests" 
ON public.clearance_requests FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Clearance Status
CREATE POLICY "Students can view their own status" 
ON public.clearance_status FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.clearance_requests WHERE id = clearance_status.request_id AND student_id = auth.uid()));

CREATE POLICY "Staff can view status for their department" 
ON public.clearance_status FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'admin' OR (role = 'staff' AND department_id = clearance_status.department_id))));

CREATE POLICY "Staff can update status for their department" 
ON public.clearance_status FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'admin' OR (role = 'staff' AND department_id = clearance_status.department_id))));


-- Insert default departments
INSERT INTO public.departments (name, description) VALUES
('Library', 'Clearance for books and library fines'),
('Finance', 'Tuition and other fees'),
('Sports', 'Sports equipment return'),
('Faculty', 'Academic clearance'),
('Alumni', 'Alumni registration');
