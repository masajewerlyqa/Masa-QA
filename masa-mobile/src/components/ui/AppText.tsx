import { Text, type TextProps } from 'react-native';

type AppTextProps = TextProps & {
  className?: string;
};

/** Typography primitive using NativeWind `className`. */
export function AppText({ className, ...props }: AppTextProps): React.JSX.Element {
  return <Text className={className} {...props} />;
}
