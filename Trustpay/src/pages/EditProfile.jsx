import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Check, User, Phone, Building2, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    company: '',
    city: '',
    emirates_id: '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user?.full_name || '',
        phone: user?.phone || '',
        company: user?.company || '',
        city: user?.city || '',
        emirates_id: user?.emirates_id || '',
      });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUser(form);
      toast.success('Profile updated');
      navigate('/profile');
    } catch (err) {
      toast.error(err?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { key: 'full_name', label: 'Full Name', icon: User, placeholder: 'Your full name', type: 'text' },
    { key: 'phone', label: 'Phone Number', icon: Phone, placeholder: '+971 50 000 0000', type: 'tel' },
    { key: 'company', label: 'Company / Business', icon: Building2, placeholder: 'Company name (optional)', type: 'text' },
    { key: 'city', label: 'City', icon: MapPin, placeholder: 'Dubai, Abu Dhabi...', type: 'text' },
    { key: 'emirates_id', label: 'Emirates ID', icon: null, placeholder: '784-XXXX-XXXXXXX-X', type: 'text' },
  ];

  return (
    <div className="px-5 pt-14">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="w-10 h-10 glass rounded-full flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-xl font-bold">Edit Profile</h1>
      </motion.div>

      {/* Avatar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center mb-8"
      >
        <div className="w-20 h-20 rounded-full glass-accent flex items-center justify-center text-2xl font-bold text-primary mb-2">
          {(form.full_name || user?.full_name || 'U')[0].toUpperCase()}
        </div>
        <p className="text-xs text-muted-foreground">{user?.email}</p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSave}
        className="space-y-4"
      >
        {fields.map(({ key, label, icon: Icon, placeholder, type }) => (
          <div key={key} className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">{label}</Label>
            <div className="relative">
              {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />}
              <Input
                type={type}
                value={form[key]}
                onChange={(e) => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                placeholder={placeholder}
                className={`glass border-white/5 h-12 rounded-xl text-sm placeholder:text-muted-foreground/40 ${Icon ? 'pl-11' : ''}`}
              />
            </div>
          </div>
        ))}

        {/* Email (read-only) */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Email</Label>
          <Input
            value={user?.email || ''}
            disabled
            className="glass border-white/5 h-12 rounded-xl text-sm text-muted-foreground"
          />
          <p className="text-[10px] text-muted-foreground pl-1">Email cannot be changed</p>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            disabled={saving}
            className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <><Check className="w-4 h-4 mr-2" />Save Changes</>
            )}
          </Button>
        </div>
      </motion.form>
    </div>
  );
}
