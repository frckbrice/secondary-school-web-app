import React from 'react';
import FacilityDetailPage from '../../../../components/pages/about/facility-detail';

interface FacilityDetailProps {
  params: Promise<{ id: string }>;
}

export default async function FacilityDetail({ params }: FacilityDetailProps) {
  const { id } = await params;
  return <FacilityDetailPage facilityId={id} />;
}
