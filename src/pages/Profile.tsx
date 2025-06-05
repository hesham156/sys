import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Lock, Mail, AlertCircle } from 'lucide-react';

const Profile: React.FC = () => {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // This is a placeholder for actual profile update functionality
    // In a real app, you would implement this using Firebase Auth
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Profile updated successfully');
      setIsEditing(false);
      setError('');
    } catch (error) {
      setError('Failed to update profile');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    if (newPassword.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    
    // This is a placeholder for actual password update functionality
    // In a real app, you would implement this using Firebase Auth
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
    } catch (error) {
      setError('Failed to update password');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = () => {
    switch(currentUser?.role) {
      case 'sales': return 'bg-blue-100 text-blue-800';
      case 'designer': return 'bg-purple-100 text-purple-800';
      case 'manager': return 'bg-green-100 text-green-800';
      case 'production': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
        <p className="text-gray-600">
          View and update your account information
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex-shrink-0 h-24 w-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold">
              {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{currentUser?.displayName}</h2>
              <p className="text-gray-600 mt-1">{currentUser?.email}</p>
              <div className="mt-2">
                <span className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full ${getRoleColor()}`}>
                  {currentUser?.role.charAt(0).toUpperCase() + currentUser?.role.slice(1)}
                </span>
              </div>
            </div>
            
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="sm:ml-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Edit Profile
              </button>
            )}
          </div>
          
          {success && (
            <div className="mt-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {isEditing ? (
            <div className="mt-8">
              <form onSubmit={handleUpdateProfile}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                      Display Name
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Your name"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        value={currentUser?.email}
                        disabled
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Email address cannot be changed</p>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setDisplayName(currentUser?.displayName || '');
                        setError('');
                        setSuccess('');
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`px-4 py-2 rounded-md text-white ${
                        loading
                          ? 'bg-blue-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <div className="mt-8 border-t border-gray-200 pt-8">
              <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
              <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Display Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{currentUser?.displayName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email Address</dt>
                  <dd className="mt-1 text-sm text-gray-900">{currentUser?.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Role</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">{currentUser?.role}</dd>
                </div>
              </dl>
            </div>
          )}
          
          <div className="mt-8 border-t border-gray-200 pt-8">
            <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
            <form onSubmit={handleUpdatePassword} className="mt-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">
                    Current Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="current-password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter current password"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter new password"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="confirm-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-4 py-2 rounded-md text-white ${
                      loading || !currentPassword || !newPassword || !confirmPassword
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;