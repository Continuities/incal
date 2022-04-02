/**
 * Circular Layout
 * @flow
 **/

import { Translate } from '@mui/icons-material';
import React, {
    ReactNode,
    CSSProperties,
    Children,
    useContext,
    createContext,
    forwardRef,
} from 'react';
import {
    Box,
} from '@mui/material';

function transform(rad: number, radius: number): string {
    const { sin, cos } = Math;
    return [
    `translate(-50%, -50%)`,
    ].join(" ");
 }

 type LayoutContextData = {
    radius: number;
  };
  
  const LayoutContext = createContext<LayoutContextData>({ radius: 0 });
  
  function useLayoutContext(): LayoutContexData {
    const context = useContext(LayoutContext);
  
    if (!context) {
      throw new Error(
        `compound components cannot be rendered outside the CircleLayout component`
      );
    }
  
    return context;
  }
  
  type RadianProps = {
    radian: number;
    children: ReactNode;
    style?: CSSProperties;
    className?: string;
  };
  export function Radian({
    radian,
    children,
    style,
    className,
  }: RadianProps): JSX.Element {
    const { radius } = useLayoutContext();
  
    return (
      <div
        className={className}
        style={{
          ...style,
          position: "absolute",
          top: `${Math.sin(radian) * 40}%`,
          left: `${Math.cos(radian) * 40}%`,
          transform: transform(radian, 40),
        }}
      >
        {children}
      </div>
    );
  }
  
  interface CircleLayoutProps {
    radius: number;
    children: ReactNode | ReactNode[];
    style?: CSSProperties;
    className?: string;
  }
  export const CircleLayout = forwardRef<HTMLDivElement, CircleLayoutProps>(
    ({ radius = 0, children, style, className }, ref): JSX.Element => {
      const center: CSSProperties = {
        position: `absolute`,
        top: `50%`,
        left: `50%`,
      };
  
      return (
        <div
          className={className}
          style={{
            ...style,
            position: "relative",
            width: `100%`,
            aspectRatio: "1/1",
            transform: "translate( 50%, 50%)"
          }}
          ref={ref}
        >
            <Box sx={{
                position: "absolute",
                width: '88%',
                aspectRatio:"1/1",
                border: '30px solid',
                borderRadius: "50%",
                opacity: "50%",
                transform: "translate( -50%, -50%)"
            }}
            ></Box>
          <LayoutContext.Provider value={{ radius }}>
            {children}
          </LayoutContext.Provider>
        </div>
        
      );
    }
  );