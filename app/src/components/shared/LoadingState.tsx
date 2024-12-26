// src/components/shared/LoadingState.tsx
import styled from 'styled-components';

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
`;

export function LoadingState() {
  return (
    <LoadingWrapper>
      <div>Loading...</div>
    </LoadingWrapper>
  );
}