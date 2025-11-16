-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types for project statuses and roles
CREATE TYPE project_status AS ENUM (
  'Pending_Review',
  'Prioritized',
  'Funded',
  'Open_For_Bidding',
  'In_Progress',
  'Completed',
  'On_Hold',
  'Cancelled'
);

CREATE TYPE user_role AS ENUM (
  'System_Administrator',
  'Planner',
  'Development_Council',
  'Legislator',
  'Budget_Officer',
  'BAC_Secretariat',
  'Technical_Inspector',
  'Contractor',
  'Public_User'
);

CREATE TYPE milestone_status AS ENUM (
  'Not_Started',
  'In_Progress',
  'Completed',
  'Delayed'
);

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'Public_User',
  office_name TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create contractors table
CREATE TABLE IF NOT EXISTS contractors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  tin TEXT UNIQUE NOT NULL,
  registration_number TEXT,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  contact_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  barangay TEXT NOT NULL,
  project_category TEXT NOT NULL,
  estimated_cost DECIMAL(12, 2) NOT NULL,
  approved_budget_amount DECIMAL(12, 2),
  amount_disbursed DECIMAL(12, 2) DEFAULT 0,
  fund_source_code TEXT,
  status project_status DEFAULT 'Pending_Review',
  proposed_solution TEXT,
  problem_description TEXT,
  contractor_id UUID REFERENCES contractors(id),
  contract_amount DECIMAL(12, 2),
  start_date DATE,
  end_date DATE,
  expected_completion_date DATE,
  actual_completion_date DATE,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create project documents table
CREATE TABLE IF NOT EXISTS project_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create bids table
CREATE TABLE IF NOT EXISTS bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  bid_amount DECIMAL(12, 2) NOT NULL,
  bid_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_winning_bid BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create milestones table
CREATE TABLE IF NOT EXISTS milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  percentage_complete INTEGER NOT NULL CHECK (percentage_complete >= 0 AND percentage_complete <= 100),
  status milestone_status DEFAULT 'Not_Started',
  scheduled_start_date DATE,
  scheduled_end_date DATE,
  actual_completion_date DATE,
  order_sequence INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create project updates table (progress reports)
CREATE TABLE IF NOT EXISTS project_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL REFERENCES users(id),
  percentage_complete INTEGER NOT NULL CHECK (percentage_complete >= 0 AND percentage_complete <= 100),
  report_text TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  is_pending_approval BOOLEAN DEFAULT true,
  approved_by UUID REFERENCES users(id),
  approval_comments TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create update attachments table
CREATE TABLE IF NOT EXISTS update_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  update_id UUID NOT NULL REFERENCES project_updates(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  attachment_type TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  donor_name TEXT NOT NULL,
  donation_description TEXT NOT NULL,
  quantity INTEGER,
  unit TEXT,
  donation_date DATE NOT NULL,
  logged_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create project history (audit log) table
CREATE TABLE IF NOT EXISTS project_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  changed_by UUID NOT NULL REFERENCES users(id),
  action_type TEXT NOT NULL,
  old_status project_status,
  new_status project_status,
  change_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create bid invitations table
CREATE TABLE IF NOT EXISTS bid_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  bid_opening_date DATE NOT NULL,
  bid_closing_date DATE NOT NULL,
  pre_bid_conference_date DATE,
  requirements TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE update_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE bid_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all users" ON users FOR SELECT USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'System_Administrator'
);
CREATE POLICY "Admins can update all users" ON users FOR UPDATE USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'System_Administrator'
);

-- RLS Policies for contractors table (read-only for most, manage for BAC)
CREATE POLICY "Anyone can view contractors" ON contractors FOR SELECT USING (true);
CREATE POLICY "BAC Secretariat can insert contractors" ON contractors FOR INSERT WITH CHECK (
  (SELECT role FROM users WHERE id = auth.uid()) = 'BAC_Secretariat'
);
CREATE POLICY "BAC Secretariat can update contractors" ON contractors FOR UPDATE USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'BAC_Secretariat'
);

-- RLS Policies for projects table
CREATE POLICY "Planners can view projects they created" ON projects FOR SELECT USING (
  auth.uid() = created_by OR
  (SELECT role FROM users WHERE id = auth.uid()) IN ('System_Administrator', 'Development_Council', 'Budget_Officer', 'BAC_Secretariat', 'Technical_Inspector', 'Legislator')
);
CREATE POLICY "Contractors can view projects they bid on or are assigned to" ON projects FOR SELECT USING (
  contractor_id = (SELECT id FROM contractors WHERE email = (SELECT email FROM users WHERE id = auth.uid())) OR
  (SELECT role FROM users WHERE id = auth.uid()) != 'Contractor'
);
CREATE POLICY "Public can view funded projects" ON projects FOR SELECT USING (
  status = 'In_Progress' OR status = 'Completed' OR
  (SELECT role FROM users WHERE id = auth.uid()) IS NULL
);
CREATE POLICY "Planners can insert projects" ON projects FOR INSERT WITH CHECK (
  (SELECT role FROM users WHERE id = auth.uid()) = 'Planner'
);
CREATE POLICY "Appropriate roles can update projects" ON projects FOR UPDATE USING (
  (SELECT role FROM users WHERE id = auth.uid()) IN ('System_Administrator', 'Development_Council', 'Budget_Officer', 'BAC_Secretariat', 'Technical_Inspector') OR
  auth.uid() = created_by
);

-- RLS Policies for project documents
CREATE POLICY "Users can view documents for projects they have access to" ON project_documents FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM projects WHERE projects.id = project_documents.project_id AND (
      projects.created_by = auth.uid() OR
      (SELECT role FROM users WHERE id = auth.uid()) IN ('System_Administrator', 'Development_Council', 'Budget_Officer', 'BAC_Secretariat', 'Technical_Inspector', 'Legislator')
    )
  )
);
CREATE POLICY "Users can insert documents for projects they created" ON project_documents FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects WHERE projects.id = project_documents.project_id AND projects.created_by = auth.uid()
  )
);

-- RLS Policies for bids
CREATE POLICY "BAC can view all bids" ON bids FOR SELECT USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'BAC_Secretariat'
);
CREATE POLICY "Contractors can view their own bids" ON bids FOR SELECT USING (
  contractor_id IN (SELECT id FROM contractors WHERE email = (SELECT email FROM users WHERE id = auth.uid()))
);
CREATE POLICY "Contractors can insert bids" ON bids FOR INSERT WITH CHECK (
  (SELECT role FROM users WHERE id = auth.uid()) = 'Contractor'
);

-- RLS Policies for milestones
CREATE POLICY "Users can view milestones for accessible projects" ON milestones FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM projects WHERE projects.id = milestones.project_id AND (
      projects.created_by = auth.uid() OR
      (SELECT role FROM users WHERE id = auth.uid()) IN ('System_Administrator', 'Development_Council', 'Budget_Officer', 'BAC_Secretariat', 'Technical_Inspector', 'Legislator')
    )
  )
);
CREATE POLICY "Technical Inspector can manage milestones" ON milestones FOR INSERT WITH CHECK (
  (SELECT role FROM users WHERE id = auth.uid()) = 'Technical_Inspector'
);
CREATE POLICY "Technical Inspector can update milestones" ON milestones FOR UPDATE USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'Technical_Inspector'
);

-- RLS Policies for project updates
CREATE POLICY "Appropriate users can view project updates" ON project_updates FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM projects WHERE projects.id = project_updates.project_id AND (
      projects.created_by = auth.uid() OR
      (SELECT role FROM users WHERE id = auth.uid()) IN ('System_Administrator', 'Technical_Inspector')
    )
  ) OR
  project_updates.submitted_by = auth.uid()
);
CREATE POLICY "Contractors can submit updates" ON project_updates FOR INSERT WITH CHECK (
  (SELECT role FROM users WHERE id = auth.uid()) = 'Contractor'
);
CREATE POLICY "Technical Inspector can approve updates" ON project_updates FOR UPDATE USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'Technical_Inspector'
);

-- RLS Policies for donations
CREATE POLICY "Users can view donations for accessible projects" ON donations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM projects WHERE projects.id = donations.project_id AND (
      projects.created_by = auth.uid() OR
      (SELECT role FROM users WHERE id = auth.uid()) IN ('System_Administrator', 'Technical_Inspector')
    )
  )
);
CREATE POLICY "Technical Inspector can log donations" ON donations FOR INSERT WITH CHECK (
  (SELECT role FROM users WHERE id = auth.uid()) = 'Technical_Inspector'
);

-- RLS Policies for project history
CREATE POLICY "Audit logs visible to admins only" ON project_history FOR SELECT USING (
  (SELECT role FROM users WHERE id = auth.uid()) IN ('System_Administrator', 'Technical_Inspector')
);

-- RLS Policies for bid invitations
CREATE POLICY "Anyone can view public bid invitations" ON bid_invitations FOR SELECT USING (true);
CREATE POLICY "BAC Secretariat can manage bid invitations" ON bid_invitations FOR INSERT WITH CHECK (
  (SELECT role FROM users WHERE id = auth.uid()) = 'BAC_Secretariat'
);
CREATE POLICY "BAC Secretariat can update bid invitations" ON bid_invitations FOR UPDATE USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'BAC_Secretariat'
);
