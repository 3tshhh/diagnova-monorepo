import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { PageHeader } from '../components/PageHeader';
import { getProfile, removeProfilePhoto, saveProfilePhoto, updateProfile } from '../api/profile';
import { deleteAccount, updatePassword } from '../api/auth';
import { useAuthGuard } from '../api/useAuthGuard';
import type { PatientProfile } from '../api/types';

type ProfileForm = {
  fullName: string;
  phoneNumber: string;
  address: string;
  age: string;
  nationalId: string;
};

function toForm(profile: PatientProfile): ProfileForm {
  return {
    fullName: profile.fullName ?? '',
    phoneNumber: profile.phoneNumber ?? '',
    address: profile.address ?? '',
    age: profile.age === null ? '' : String(profile.age),
    nationalId: profile.nationalId ?? '',
  };
}

function getInitials(name: string | null, email: string): string {
  const source = (name || email).trim();
  return source
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2);
}

export function ProfilePage() {
  useAuthGuard();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [form, setForm] = useState<ProfileForm>({
    fullName: '',
    phoneNumber: '',
    address: '',
    age: '',
    nationalId: '',
  });
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [removingPhoto, setRemovingPhoto] = useState(false);
  const [error, setError] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEmailInput, setDeleteEmailInput] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const deleteInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
        setForm(toForm(data));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load profile';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, []);

  const initials = useMemo(() => {
    if (!profile) return 'NA';
    return getInitials(profile.fullName, profile.email);
  }, [profile]);

  const onPhotoSelected = async (file: File | undefined) => {
    if (!file || !profile) return;

    setUploadingPhoto(true);
    setError('');
    setProfileMessage('');

    try {
      const response = await saveProfilePhoto(file, Boolean(profile.photoUrl));
      setProfile({ ...profile, photoUrl: response.photoUrl });
      setProfileMessage(response.message);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to upload photo';
      setError(message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const onSaveProfile = async () => {
    if (!profile) return;

    setSavingProfile(true);
    setError('');
    setProfileMessage('');

    try {
      const updated = await updateProfile({
        fullName: form.fullName.trim() || undefined,
        phoneNumber: form.phoneNumber.trim() || undefined,
        address: form.address.trim() || undefined,
        age: form.age.trim() ? Number(form.age) : undefined,
        nationalId: form.nationalId.trim() || undefined,
      });

      setProfile(updated);
      setForm(toForm(updated));
      setEditing(false);
      setProfileMessage('Profile updated successfully.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to save profile';
      setError(message);
    } finally {
      setSavingProfile(false);
    }
  };

  const onRemovePhoto = async () => {
    if (!profile?.photoUrl) return;

    setRemovingPhoto(true);
    setError('');
    setProfileMessage('');

    try {
      const response = await removeProfilePhoto();
      setProfile({ ...profile, photoUrl: response.photoUrl });
      setProfileMessage(response.message);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to remove photo';
      setError(message);
    } finally {
      setRemovingPhoto(false);
    }
  };

  const onSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pw.current || !pw.next || !pw.confirm) {
      setPasswordError('Please complete all password fields.');
      return;
    }
    if (pw.next !== pw.confirm) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setSavingPassword(true);
    setPasswordError('');
    setPasswordMessage('');

    try {
      const response = await updatePassword({
        oldPassword: pw.current,
        newPassword: pw.next,
      });
      setPasswordMessage(response.message);
      setPw({ current: '', next: '', confirm: '' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update password';
      setPasswordError(message);
    } finally {
      setSavingPassword(false);
    }
  };

  const openDeleteModal = () => {
    setDeleteEmailInput('');
    setDeleteError('');
    setShowDeleteModal(true);
    setTimeout(() => deleteInputRef.current?.focus(), 50);
  };

  const onConfirmDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    if (deleteEmailInput.trim().toLowerCase() !== profile.email.toLowerCase()) {
      setDeleteError('Email does not match your account email.');
      return;
    }

    setDeletingAccount(true);
    setDeleteError('');

    try {
      await deleteAccount(deleteEmailInput.trim());
      navigate('/login');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to delete account';
      setDeleteError(message);
      setDeletingAccount(false);
    }
  };

  const cancelEditing = () => {
    if (!profile) return;
    setForm(toForm(profile));
    setEditing(false);
    setError('');
    setProfileMessage('');
  };

  if (loading) {
    return (
      <div className="fade-up" style={{ display: 'grid', placeItems: 'center', minHeight: 320 }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="fade-up">
        <PageHeader eyebrow="Account" title="Profile" sub="Manage your personal info and credentials." />
        <div className="card" style={{ padding: 24, color: 'var(--danger)' }}>
          {error || 'Unable to load profile.'}
        </div>
      </div>
    );
  }

  return (
    <div className="fade-up">
      <PageHeader eyebrow="Account" title="Profile" sub="Manage your personal info and credentials." />

      <div
        style={{ display: 'grid', gridTemplateColumns: '320px minmax(0, 1fr)', gap: 20 }}
        className="profile-grid"
      >
        <div className="card" style={{ padding: 28, textAlign: 'center', height: 'fit-content' }}>
          {profile.photoUrl ? (
            <img
              src={profile.photoUrl}
              alt={profile.fullName ?? profile.email}
              style={{
                width: 96,
                height: 96,
                borderRadius: 999,
                margin: '0 auto 16px',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          ) : (
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: 999,
                margin: '0 auto 16px',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                fontWeight: 600,
                letterSpacing: '-0.02em',
                boxShadow: '0 12px 24px -8px rgba(13, 148, 136, 0.4)',
              }}
            >
              {initials}
            </div>
          )}
          <h3 style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.015em', margin: '0 0 4px' }}>
            {profile.fullName || 'Diagnova user'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '0 0 4px' }}>{profile.email}</p>
          <p className="mono" style={{ fontSize: 11, color: 'var(--text-subtle)', margin: 0 }}>
            Joined {new Date(profile.createdAt).getFullYear()}
          </p>
          <div style={{ height: 1, background: 'var(--border)', margin: '20px 0' }} />
          <label className="btn btn-outline" style={{ width: '100%', cursor: uploadingPhoto ? 'wait' : 'pointer' }}>
            {uploadingPhoto ? 'Uploading photo...' : profile.photoUrl ? 'Update photo' : 'Upload photo'}
            <input
              type="file"
              accept="image/*"
              hidden
              disabled={uploadingPhoto}
              onChange={(e) => void onPhotoSelected(e.target.files?.[0])}
            />
          </label>
          {profile.photoUrl && (
            <button
              type="button"
              className="btn btn-danger-ghost btn-sm"
              style={{ width: '100%', marginTop: 10 }}
              onClick={() => void onRemovePhoto()}
              disabled={removingPhoto}
            >
              {removingPhoto ? 'Removing photo...' : 'Remove photo'}
            </button>
          )}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              fontSize: 13,
              color: 'var(--text-muted)',
              textAlign: 'left',
              marginTop: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
              <span>Phone</span>
              <span className="mono" style={{ color: 'var(--text)' }}>
                {profile.phoneNumber || 'Not set'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
              <span>Age</span>
              <span className="mono" style={{ color: 'var(--text)' }}>
                {profile.age ?? 'Not set'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
              <span>National ID</span>
              <span className="mono" style={{ color: 'var(--text)' }}>
                {profile.nationalId || 'Not set'}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: 28 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
                gap: 12,
              }}
            >
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.015em', margin: 0 }}>
                  Personal info
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  Saved to your account and used across the app shell.
                </p>
              </div>
              <button type="button" onClick={() => setEditing((value) => !value)} className="btn btn-outline btn-sm">
                {editing ? 'Stop editing' : 'Edit profile'}
              </button>
            </div>

            {error && (
              <div
                style={{
                  fontSize: 13,
                  color: 'var(--danger)',
                  background: 'var(--danger-50)',
                  padding: '8px 12px',
                  borderRadius: 8,
                  marginBottom: 16,
                }}
              >
                {error}
              </div>
            )}

            {profileMessage && (
              <div
                style={{
                  fontSize: 13,
                  color: '#047857',
                  background: 'var(--success-50)',
                  padding: '8px 12px',
                  borderRadius: 8,
                  marginBottom: 16,
                }}
              >
                {profileMessage}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="field-label">Full name</label>
                <input
                  className="input"
                  disabled={!editing}
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  style={{ background: editing ? '#fff' : '#FAFCFC' }}
                />
              </div>
              <div>
                <label className="field-label">Email</label>
                <input className="input" disabled value={profile.email} style={{ background: '#FAFCFC' }} />
              </div>
              <div>
                <label className="field-label">Phone number</label>
                <input
                  className="input"
                  disabled={!editing}
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  style={{ background: editing ? '#fff' : '#FAFCFC' }}
                />
              </div>
              <div>
                <label className="field-label">Age</label>
                <input
                  className="input"
                  type="number"
                  min={0}
                  max={150}
                  disabled={!editing}
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  style={{ background: editing ? '#fff' : '#FAFCFC' }}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="field-label">Address</label>
                <input
                  className="input"
                  disabled={!editing}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  style={{ background: editing ? '#fff' : '#FAFCFC' }}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="field-label">National ID</label>
                <input
                  className="input"
                  disabled={!editing}
                  value={form.nationalId}
                  onChange={(e) => setForm({ ...form, nationalId: e.target.value })}
                  style={{ background: editing ? '#fff' : '#FAFCFC' }}
                />
              </div>
            </div>

            {editing && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                <button type="button" onClick={cancelEditing} className="btn btn-outline">
                  Cancel
                </button>
                <button type="button" onClick={() => void onSaveProfile()} className="btn btn-primary" disabled={savingProfile}>
                  {savingProfile ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            )}
          </div>

          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.015em', margin: '0 0 4px' }}>
              Change password
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 20px' }}>
              Use at least 8 characters with a mix of letters, numbers, and symbols.
            </p>

            <form onSubmit={onSavePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 480 }}>
              <div>
                <label className="field-label">Current password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="........"
                  value={pw.current}
                  onChange={(e) => setPw({ ...pw, current: e.target.value })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="field-label">New password</label>
                  <input
                    className="input"
                    type="password"
                    placeholder="........"
                    value={pw.next}
                    onChange={(e) => setPw({ ...pw, next: e.target.value })}
                  />
                </div>
                <div>
                  <label className="field-label">Confirm</label>
                  <input
                    className="input"
                    type="password"
                    placeholder="........"
                    value={pw.confirm}
                    onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                  />
                </div>
              </div>

              {passwordError && (
                <div
                  style={{
                    fontSize: 13,
                    color: 'var(--danger)',
                    background: 'var(--danger-50)',
                    padding: '8px 12px',
                    borderRadius: 8,
                  }}
                >
                  {passwordError}
                </div>
              )}

              {passwordMessage && (
                <div
                  style={{
                    fontSize: 13,
                    color: '#047857',
                    background: 'var(--success-50)',
                    padding: '8px 12px',
                    borderRadius: 8,
                  }}
                >
                  {passwordMessage}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                <button className="btn btn-primary" disabled={savingPassword}>
                  {savingPassword ? 'Saving...' : 'Save password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 28, marginTop: 20, borderColor: 'var(--danger)', borderWidth: 1, borderStyle: 'solid' }}>
        <h3 style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.015em', margin: '0 0 4px', color: 'var(--danger)' }}>
          Danger zone
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 20px' }}>
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <button
          type="button"
          className="btn btn-danger-ghost"
          onClick={openDeleteModal}
        >
          Remove account
        </button>
      </div>

      {showDeleteModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
          onClick={(e) => { if (e.target === e.currentTarget && !deletingAccount) setShowDeleteModal(false); }}
        >
          <div
            className="card"
            style={{ padding: 28, width: '100%', maxWidth: 440 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 8px', color: 'var(--danger)' }}>
              Delete account
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 20px', lineHeight: 1.6 }}>
              This will permanently delete your account, all your cases, diagnoses, and images. There is no way to recover this data.
            </p>
            <p style={{ fontSize: 13, color: 'var(--text)', margin: '0 0 12px', fontWeight: 500 }}>
              Type your email address to confirm:
            </p>
            <form onSubmit={(e) => void onConfirmDeleteAccount(e)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input
                ref={deleteInputRef}
                className="input"
                type="email"
                placeholder={profile?.email}
                value={deleteEmailInput}
                onChange={(e) => { setDeleteEmailInput(e.target.value); setDeleteError(''); }}
                disabled={deletingAccount}
                autoComplete="off"
              />
              {deleteError && (
                <div style={{ fontSize: 13, color: 'var(--danger)', background: 'var(--danger-50)', padding: '8px 12px', borderRadius: 8 }}>
                  {deleteError}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deletingAccount}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn"
                  style={{ background: 'var(--danger)', color: '#fff', borderColor: 'var(--danger)' }}
                  disabled={deletingAccount || !deleteEmailInput.trim()}
                >
                  {deletingAccount ? 'Deleting...' : 'Delete my account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 880px) { .profile-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
