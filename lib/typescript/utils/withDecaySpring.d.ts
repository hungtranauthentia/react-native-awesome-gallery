import type { WithDecayConfig, WithSpringConfig } from 'react-native-reanimated';
export declare function withDecaySpring(userConfig: WithDecayConfig & WithSpringConfig & {
    clamp: [number, number];
}, callback?: (edge: {
    isEdge: boolean;
}) => void): number;
