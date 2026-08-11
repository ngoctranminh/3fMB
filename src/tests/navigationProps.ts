import type { Paths } from '@/navigation/paths';
import type {
  MainTabParamList,
  MainTabScreenProps,
  RootScreenProps,
} from '@/navigation/types';

// Tab screens giờ nhận navigation/route thật; test chỉ cần navigate() để assert
export const createTabScreenProps = <S extends keyof MainTabParamList>(
  name: S,
) => {
  const navigate = jest.fn();

  return {
    navigate,
    props: {
      navigation: { navigate },
      route: { key: `${name}-test`, name },
    } as unknown as MainTabScreenProps<S>,
  };
};

// Detail screens chỉ dùng goBack và route.params nên phần còn lại để trống
export const createDetailScreenProps = <
  S extends Paths.ItemDetail | Paths.ReceiptDetail,
>(
  name: S,
  parameters: RootScreenProps<S>['route']['params'],
) => {
  const goBack = jest.fn();

  return {
    goBack,
    props: {
      navigation: { goBack },
      route: { key: `${name}-test`, name, params: parameters },
    } as unknown as RootScreenProps<S>,
  };
};
