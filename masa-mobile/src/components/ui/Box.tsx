import { View, type ViewProps } from 'react-native';

type BoxProps = ViewProps & {
  className?: string;
};

/** Layout primitive using NativeWind `className`. */
export function Box({ className, ...props }: BoxProps): React.JSX.Element {
  return <View className={className} {...props} />;
}
