import React from 'react';
import AchievementDetailPage from '../../../../components/pages/about/achievement-detail';

interface AchievementDetailProps {
  params: Promise<{ id: string }>;
}

export default async function AchievementDetail({
  params,
}: AchievementDetailProps) {
  const { id } = await params;
  return <AchievementDetailPage achievementId={id} />;
}
