import {useState, useEffect, ReactElement} from 'react';

type Props = {
  children: ReactElement;
};

export default function LazyRender({children}: Props) {
  const [isChildVisible, setIsChildVisible] = useState(false);

  useEffect(() => {
    setIsChildVisible(true);
  }, []);

  return isChildVisible ? children : null;
}
