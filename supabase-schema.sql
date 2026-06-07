-- Setup script for Nayantara Opticals Supabase Backend

-- 1. Create Branches Table
CREATE TABLE public.branches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Users Table (Extension of auth.users)
-- We store user role (admin or operator), branch association, and approval status
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'operator')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL, -- Nullable for admins
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Transactions Table (The Ledger)
CREATE TABLE public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('in', 'out')),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    source_category TEXT NOT NULL,
    payment_mode TEXT NOT NULL,
    description TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Set up Row Level Security (RLS)

-- Enable RLS
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Branches Policy
-- Admins can read all, Operators can read their own branch
CREATE POLICY "Admins can view all branches" ON public.branches
    FOR SELECT USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

CREATE POLICY "Operators can view their own branch" ON public.branches
    FOR SELECT USING (id IN (SELECT branch_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Only admins can insert/update/delete branches" ON public.branches
    FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Profiles Policy
-- Admins can read/write all profiles. Operators can only read their own.
CREATE POLICY "Admins can manage all profiles" ON public.profiles
    FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Transactions Policy
-- Admins can read/write all transactions. Operators can only read/write transactions for their assigned branch.
CREATE POLICY "Admins can manage all transactions" ON public.transactions
    FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

CREATE POLICY "Operators can view transactions for their branch" ON public.transactions
    FOR SELECT USING (branch_id IN (SELECT branch_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Operators can insert transactions for their branch" ON public.transactions
    FOR INSERT WITH CHECK (branch_id IN (SELECT branch_id FROM public.profiles WHERE id = auth.uid()));

-- 5. Trigger to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role, status, full_name)
    VALUES (
        new.id, 
        new.email, 
        COALESCE((new.raw_user_meta_data->>'role')::text, 'operator'), -- Default to operator if not provided
        'pending', -- All new users are pending by default
        (new.raw_user_meta_data->>'full_name')::text
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert an initial branch for testing
INSERT INTO public.branches (name, location) VALUES ('Main Branch', 'Headquarters');
