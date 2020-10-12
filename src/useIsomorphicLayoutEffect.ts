import {useLayoutEffect, useEffect} from 'react';

export default typeof window !== 'undefined' ? useLayoutEffect : useEffect;
