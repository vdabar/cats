import React, { createContext, useContext, useEffect, useState } from 'react';
const Breeds = createContext({});

export const BreedsState = () => {
  return useContext(Breeds);
};
