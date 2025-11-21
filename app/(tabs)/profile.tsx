import React from 'react';
import { useStorefront } from '../src/context/storefront.context';
import LoginScreen from '../src/presentation/screens/LoginScreen';
import ProfileScreen from '../src/presentation/screens/ProfileScreen';

export default function ProfileTab() {
  const { accessToken } = useStorefront().useLoginStore();

  if (accessToken) {
    return <ProfileScreen />;
  }

  return <LoginScreen />;
}
