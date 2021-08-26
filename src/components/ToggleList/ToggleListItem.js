import { AnimatePresence, motion } from 'framer-motion';
import {
  Button,
  ListGroup,
  ListGroupItem,
  SvgIcon,
  ToggleSwitch,
} from 'insomnia-components';
import React from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useToggle } from 'react-use';
import styled from 'styled-components';
import { useInsomniaZipkin } from '../context/insomniaZipkinContext';
import { ZipkinRequest } from '../lib/ZipkinRequest';
import { Badge } from './Badge';

const StyledTopListItem = styled(ListGroupItem)`
  padding: 0 var(--padding-sm);
  > div:first-of-type {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
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
    > span {
      padding: 0 var(--padding-sm);
    }
  }
  button {
    padding: 0px var(--padding-sm);
  }
`;

const StyledContentList = styled(motion.div)`
  display: block;
  height: 0px;
  overflow: hidden;
`;

export function ToggleListItem({
  id,
  label,
  children,
  onButtonClick,
  isOpen,
  toggleIsEnabled,
  onToggleChange,
  ...props
}) {
  return (
    <StyledTopListItem>
      <div>
        <Button
          onClick={onButtonClick}
          variant="text"
          style={
            !isOpen
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

        <label htmlFor={id}>{label}</label>
        <StyledToggleSwitch>
          <ToggleSwitch
            id={id}
            checked={toggleIsEnabled}
            onChange={onToggleChange}
            {...props}
          />
        </StyledToggleSwitch>
      </div>
      <AnimatePresence>
        {isOpen && (
          <StyledContentList
            initial={{ height: '0px' }}
            animate={{ height: '100%' }}
            exit={{ height: '0px' }}
            transition={{ duration: 0.2, ease: 'easeInOut', delay: 0 }}
          >
            <ListGroup>{children}</ListGroup>
          </StyledContentList>
        )}
      </AnimatePresence>
    </StyledTopListItem>
  );
}
