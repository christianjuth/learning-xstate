import React from 'react';

type StyleSheet = {
  [key: string]: React.CSSProperties
}

export function createStyleSheet<T extends StyleSheet>(styles: T | StyleSheet): Readonly<T> {
  return styles as T;
}