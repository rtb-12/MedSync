import React from 'react';
import { ClientLogin } from '@calimero-network/calimero-client';
import { useNavigate } from 'react-router-dom';
import { clearAppEndpoint, clearApplicationId } from '../../utils/storage';
import { getNodeUrl, getStorageApplicationId } from '../../utils/node';
import { styled } from 'styled-components';
import ContentWrapper from '../../components/login/ContentWrapper';
import {  setNodeUrl } from '../../utils/node';

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;
  background-color: #111111;
  position: relative;

  .back-button {
    height: fit-content;
    color: white;
    padding: 1rem;
    cursor: pointer;
  }

  .flex-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
  }

  .title-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.75rem;
    padding-left: 3.5rem;
    padding-right: 3.5rem;
  }

  .title {
    color: white;
    font-size: 24px;
    font-weight: bold;
  }

  .card {
    background-color: #1c1c1c;
    padding: 2rem;
    border-radius: 0.5rem;
  }
`;

export default function Authenticate() {
  const navigate = useNavigate();

  function onSetupClick() {
    clearAppEndpoint();
    clearApplicationId();
    navigate('/');
  }
  const handleSetNodeUrl = (url: string) => {
    setNodeUrl(url);
    return url;
  };

  return (
    <ContentWrapper>
      <Wrapper>
        <div className="flex-wrapper">
          <div className="card">
            <div className="title-wrapper">
              <div className="title">Hospital App </div>
            </div>
            <ClientLogin
              getNodeUrl={getNodeUrl}
              setNodeUrl={handleSetNodeUrl}
              getApplicationId={getStorageApplicationId}
              sucessRedirect={() => navigate('/role-selection')}
            />
          </div>
          <div className="back-button" onClick={onSetupClick}>
            Return to setup
          </div>
        </div>
      </Wrapper>
    </ContentWrapper>
  );
}
