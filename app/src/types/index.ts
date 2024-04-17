export type Invoice = {
  date: string;
  payment_date: string;
  amount: string;
  invoice_id: string;
  invoice_url: string;
};

export type Charges = {
  date: string;
  sessions: Session[];
};

export type Session = {
  uid: string;
  user_id: number;
  start_date: string;
  end_date: string;
  duration: number;
  energy: number;
  chargemap_pass_serial: string;
  user_email: string;
  chargemap_pass_uid: string;
  amount: string;
  pool: SessionPool;
};

export type SessionPool = {
  id: number;
  slug: string;
  name: string;
  street_number: string;
  street_name: string;
  postal_code: string;
  city: string;
  latitude: number;
  longitude: number;
  icon_url: string;
  timezone: string;
  network_name: string;
  supervisor_id: number;
};
