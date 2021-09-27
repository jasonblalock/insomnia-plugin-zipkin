import { AnimatePresence, motion } from 'framer-motion';
import {
  Button,
  ListGroup,
  ListGroupItem,
  SvgIcon,
  ToggleSwitch,
} from 'insomnia-components';
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useToggle } from 'react-use';
import styled from 'styled-components';
import { useInsomniaZipkin } from '../context/insomniaZipkinContext';
import { ZipkinState } from '../lib/ZipkinState';
import { Badge } from './Badge';

const StyledTopListItem = styled(ListGroupItem)`
  padding: 0 var(--padding-sm);
  > div:first-of-type {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  svg {
    fill: var(--hl-xl);
  }
  label {
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-normal);
    margin: 0px;
    padding: 0px;
    display: flex;
    width: 100%;
    > span {
      padding: 0 var(--padding-sm);
    }
  }
  button {
    padding: 0px var(--padding-sm);
  }
`;

const StyledContentListItem = styled(ListGroupItem)`
  padding-right: 0;
  padding-top: 0;
  > div:first-of-type {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  label {
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-normal);
    margin: 0px;
    padding: 0px;
  }
  button {
    padding: 0px var(--padding-sm);
  }

  input {
    width: 50%;
  }
`;

const StyledContentList = styled(motion.div)`
  display: block;
  height: 0px;
  overflow: hidden;
`;

const StyledToggleSwitch = styled.div`
  margin: var(--padding-sm) var(--padding-sm) var(--padding-sm) auto;
  flex: 0 0 auto;
`;

export function RequestSettings({ request }) {
  const { store, initialData, syncStore } = useInsomniaZipkin();
  const queryClient = useQueryClient();
  const requestId = request._id;
  const zipkinRequest = new ZipkinState(store, requestId);
  const [isToggled, toggle] = useToggle(false);
  const toggleIconRotation = -90;
  const [headerKeyInput, setHeaderKeyInput] = useState(
    syncStore[requestId].traceIdHeaderKey,
  );

  const dataQuery = useQuery(
    requestId,
    async () => await zipkinRequest.getData(),
    {
      initialData: initialData[requestId],
    },
  );

  const enableTraceMutation = useMutation(
    async () => await zipkinRequest.enableTrace(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(requestId);
      },
    },
  );

  const disableTraceMutation = useMutation(
    async () => await zipkinRequest.disableTrace(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(requestId);
      },
    },
  );

  const enableTraceIdGenerationMutation = useMutation(
    async () => await zipkinRequest.enableTraceIdGeneration(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(requestId);
      },
    },
  );

  const disableTraceIdGenerationMutation = useMutation(
    async () => await zipkinRequest.disableTraceIdGeneration(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(requestId);
      },
    },
  );

  const setTraceIdHeaderKeyMutation = useMutation(
    async (key) => await zipkinRequest.setTraceIdHeaderKey(key),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(requestId);
      },
    },
  );

  function handleIsEnabledToggleChange(value, e) {
    if (value === true) {
      enableTraceMutation.mutate();
    } else if (value === false) {
      disableTraceMutation.mutate();
    }
  }

  function handleGenerateTraceIdToggleChange(value, e) {
    if (value === true) {
      enableTraceIdGenerationMutation.mutate();
    } else if (value === false) {
      disableTraceIdGenerationMutation.mutate();
    }
  }

  async function handleHeaderKeyInputChange(e) {
    const el = e.currentTarget;
    const value = el.value;
    syncStore[requestId].traceIdHeaderKey = value;
    setHeaderKeyInput(value);
  }

  return (
    <StyledTopListItem>
      <div>
        <Button
          onClick={toggle}
          variant="text"
          style={
            !isToggled
              ? {
                  transform: `rotate(${toggleIconRotation}deg)`,
                  transitionTimingFunction: 'ease-in-out',
                  transitionDuration: '0.2s',
                }
              : {}
          }
        >
          <SvgIcon icon="chevron-down" />
        </Button>

        <label htmlFor="isEnabled">
          <Badge method={request.method.toLowerCase()} />
          {request.name}
        </label>
        <StyledToggleSwitch>
          <ToggleSwitch
            id="isEnabled"
            checked={dataQuery.data.isEnabled}
            onChange={handleIsEnabledToggleChange}
          />
        </StyledToggleSwitch>
      </div>
      <AnimatePresence>
        {isToggled && (
          <StyledContentList
            initial={{ height: '0px' }}
            animate={{ height: '100%' }}
            exit={{ height: '0px' }}
            transition={{ duration: 0.2, ease: 'easeInOut', delay: 0 }}
          >
            <ListGroup>
              <StyledContentListItem indentLevel={2}>
                <div>
                  <Button variant="text" disabled>
                    <SvgIcon icon="indentation" />
                  </Button>
                  <label htmlFor="generateTraceId">
                    Send generated trace ID
                  </label>
                  <StyledToggleSwitch>
                    <ToggleSwitch
                      id="generateTraceId"
                      checked={dataQuery.data.generateTraceId}
                      onChange={handleGenerateTraceIdToggleChange}
                      disabled={!dataQuery.data.isEnabled}
                    />
                  </StyledToggleSwitch>
                </div>
              </StyledContentListItem>
              <StyledContentListItem indentLevel={2}>
                <div>
                  <Button variant="text" disabled>
                    <SvgIcon icon="indentation" />
                  </Button>
                  <label htmlFor="traceIdHeaderKey">
                    Response trace id header key
                  </label>
                  <div className="form-control form-control--outlined">
                    <input
                      id="traceIdHeaderKey"
                      type="text"
                      disabled={!dataQuery.data.isEnabled}
                      onChange={handleHeaderKeyInputChange}
                      value={headerKeyInput}
                    />
                  </div>
                </div>
              </StyledContentListItem>
            </ListGroup>
          </StyledContentList>
        )}
      </AnimatePresence>
    </StyledTopListItem>
  );
}
