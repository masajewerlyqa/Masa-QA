import { PropsWithChildren } from 'react';
import { SafeAreaView, View } from 'react-native';

type PageContainerProps = PropsWithChildren<{
  /** Optional NativeWind classes (e.g. `className="px-2"`). */
  className?: string;
}>;

export function PageContainer({ children, className }: PageContainerProps): React.JSX.Element {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-950">
      <View className={`flex-1 px-4 ${className ?? ''}`}>{children}</View>
    </SafeAreaView>
  );
}
