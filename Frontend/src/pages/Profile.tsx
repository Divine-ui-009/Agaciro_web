import { useRef, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

interface UserFormData {
  name: string;
  email: string;
  phone: string;
}

const resolveImage = (url: string | undefined) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const base = (api.defaults.baseURL || '').replace(/\/api\/?$/, '');
  return base + url;
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [formErrors, setFormErrors] = useState<Partial<UserFormData>>({});

  if (!user) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-blue-500 to-purple-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-lg text-slate-700 font-medium">You need to be logged in to view your profile.</p>
          <p className="text-slate-500 mt-1">Please log in to your account to access this page.</p>
        </div>
      </div>
    );
  }

  const validateForm = (): boolean => {
    const errors: Partial<UserFormData> = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (formData.phone && !/^(\+?\d{10,15})?$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Phone number is invalid';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);

      const res = await api.put('/api/auth/profile', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null
      });

      // Update user in context and localStorage
      const updatedUser = res.data.user;
      updateUser?.(updatedUser);

      // Update localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        localStorage.setItem('user', JSON.stringify({
          ...userObj,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone
        }));
      }

      setSuccess('Profile updated successfully');
      setIsEditing(false);
      setTimeout(() => setSuccess(null), 3000);

    } catch (err: unknown) {
      const getErrorMessage = (error: unknown): string => {
        if (error instanceof Error) return error.message;
        if (typeof error === 'object' && error !== null && 'response' in error) {
          const apiError = error as { response: { data: { message: string } } };
          return apiError.response?.data?.message || 'Failed to update profile';
        }
        return 'Failed to update profile';
      };
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || ''
    });
    setFormErrors({});
    setIsEditing(false);
  };

  const handleUpload = async () => {
    if (!fileRef.current || !fileRef.current.files || fileRef.current.files.length === 0) return;
    const file = fileRef.current.files[0];
    const fd = new FormData();
    fd.append('profileImage', file);

    try {
      setImageLoading(true);
      setError(null);
      const res = await api.put('/api/auth/profile-image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const profileImage = res.data?.profileImage;
      if (profileImage) {
        // Update user in context and localStorage
        updateUser?.({ profileImage });

        setSuccess('Profile image updated successfully');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: unknown) {
      const getErrorMessage = (error: unknown): string => {
        if (error instanceof Error) return error.message;
        if (typeof error === 'object' && error !== null && 'response' in error) {
          const apiError = error as { response: { data: { message: string } } };
          return apiError.response?.data?.message || 'Upload failed';
        }
        return 'Upload failed';
      };
      setError(getErrorMessage(err));
    } finally {
      setImageLoading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleRemoveImage = async () => {
    try {
      setImageLoading(true);
      setError(null);
      const res = await api.delete('/api/auth/profile-image');
      const profileImage = res.data?.profileImage;
      
      // Update user in context and localStorage
      updateUser?.({ profileImage });

      setSuccess('Profile image removed successfully');
      setTimeout(() => setSuccess(null), 3000);
      setImageError(false);
    } catch (err: unknown) {
      const getErrorMessage = (error: unknown): string => {
        if (error instanceof Error) return error.message;
        if (typeof error === 'object' && error !== null && 'response' in error) {
          const apiError = error as { response: { data: { message: string } } };
          return apiError.response?.data?.message || 'Failed to remove profile image';
        }
        return 'Failed to remove profile image';
      };
      setError(getErrorMessage(err));
    } finally {
      setImageLoading(false);
    }
  };

  const imageUrl = resolveImage(user?.profileImage || '/uploads/default/default-user.jpg');

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Profile Settings</h1>
              <p className="text-slate-500 text-sm">Manage your account and personal information</p>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden mb-8">
          {/* Profile Header Background */}
          <div className="h-32 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500"></div>

          {/* Profile Image & Basic Info */}
          <div className="px-6 sm:px-8 pb-8">
            <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-16 mb-8">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="relative w-32 h-32 bg-linear-to-br from-blue-100 to-purple-100 rounded-2xl overflow-hidden flex items-center justify-center border-4 border-white shadow-lg">
                  {imageUrl && !imageError ? (
                    <img 
                      src={imageUrl} 
                      alt="profile" 
                      className="w-full h-full object-cover" 
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <span className="text-5xl text-white font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                {imageLoading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-2xl flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-3 border-white border-t-transparent"></div>
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg"></div>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-slate-900">{user.name}</h2>
                <p className="text-slate-600 mt-1">{user.email}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                    <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                    Active
                  </span>
                </div>
              </div>

              {/* Edit Button */}
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </button>
              )}
            </div>

            {/* Photo Upload Section */}
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Profile Photo
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <label className="relative flex-1">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                    <svg className="w-5 h-5 mx-auto text-slate-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <p className="text-sm text-slate-600">
                      {fileRef.current?.files?.[0]?.name || 'Choose a photo'}
                    </p>
                  </div>
                </label>
                <button
                  onClick={handleUpload}
                  disabled={imageLoading || !fileRef.current?.files?.length}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                >
                  {imageLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Uploading...
                    </div>
                  ) : (
                    'Upload'
                  )}
                </button>
                {imageUrl && !imageUrl.includes('default-user.jpg') && (
                  <button
                    onClick={handleRemoveImage}
                    disabled={imageLoading}
                    className="px-6 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                  >
                    {imageLoading ? 'Removing...' : 'Remove'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 sm:p-8 mb-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
          </div>

          <div className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Full Name
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      formErrors.name ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {formErrors.name && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18.101 12.93a1 1 0 00-1.414-1.414L10 18.586l-6.687-6.687a1 1 0 00-1.414 1.414l8 8a1 1 0 001.414 0l10-10z" clipRule="evenodd" />
                      </svg>
                      {formErrors.name}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-slate-900 py-3 bg-slate-50 px-4 rounded-lg font-medium">{user.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Email Address
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      formErrors.email ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
                    }`}
                    placeholder="Enter your email"
                  />
                  {formErrors.email && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18.101 12.93a1 1 0 00-1.414-1.414L10 18.586l-6.687-6.687a1 1 0 00-1.414 1.414l8 8a1 1 0 001.414 0l10-10z" clipRule="evenodd" />
                      </svg>
                      {formErrors.email}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-slate-900 py-3 bg-slate-50 px-4 rounded-lg font-medium">{user.email}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Phone Number <span className="text-slate-500 font-normal">(optional)</span>
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      formErrors.phone ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
                    }`}
                    placeholder="Enter your phone number"
                  />
                  {formErrors.phone && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18.101 12.93a1 1 0 00-1.414-1.414L10 18.586l-6.687-6.687a1 1 0 00-1.414 1.414l8 8a1 1 0 001.414 0l10-10z" clipRule="evenodd" />
                      </svg>
                      {formErrors.phone}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-slate-900 py-3 bg-slate-50 px-4 rounded-lg font-medium">{user.phone || <span className="text-slate-500">Not provided</span>}</p>
              )}
            </div>

            {/* Role Display */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Account Type
              </label>
              <div className="inline-block px-4 py-3 bg-linear-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                <p className="text-slate-900 font-medium capitalize">{user.role}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-3 mt-8 pt-8 border-t border-slate-200">
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={loading}
                className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Status Messages */}
        {error && (
          <div className="animate-in fade-in slide-in-from-top-4 fixed bottom-6 right-6 max-w-sm">
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 flex gap-4 shadow-xl">
              <div className="shrink-0 mt-0.5">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700 shrink-0"
                aria-label="Close error message"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="animate-in fade-in slide-in-from-top-4 fixed bottom-6 right-6 max-w-sm">
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 flex gap-4 shadow-xl">
              <div className="shrink-0 mt-0.5">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-green-900">Success</h3>
                <p className="text-sm text-green-700 mt-1">{success}</p>
              </div>
              <button
                onClick={() => setSuccess(null)}
                className="ml-auto text-green-500 hover:text-green-700 shrink-0"
                aria-label="Close success message"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
