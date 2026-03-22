-- 1. Update Clearance Status with attachment URL
ALTER TABLE public.clearance_status 
ADD COLUMN IF NOT EXISTS attachment_url TEXT;

-- 2. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('info', 'success', 'warning', 'error')) DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS on Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 4. Policies for Notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System/Staff can create notifications for users" 
ON public.notifications FOR INSERT WITH CHECK (true); -- Staff can insert notifications for students

-- 5. Trigger to automatically mark clearance_requests as 'completed'
CREATE OR REPLACE FUNCTION public.check_all_approved()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.clearance_status WHERE request_id = NEW.request_id AND status != 'approved') = 0 THEN
    UPDATE public.clearance_requests SET status = 'completed' WHERE id = NEW.request_id;
  ELSE
    UPDATE public.clearance_requests SET status = 'pending' WHERE id = NEW.request_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_check_all_approved ON public.clearance_status;
CREATE TRIGGER tr_check_all_approved
AFTER UPDATE OF status ON public.clearance_status
FOR EACH ROW EXECUTE FUNCTION public.check_all_approved();
