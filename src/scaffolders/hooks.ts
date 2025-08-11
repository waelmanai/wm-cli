import fs from 'fs-extra';

export async function createHooks() {
  // use-actions hook
  const useActionsFile = `import { useCallback, useState } from "react";

import { ActionState, FieldErrors } from '@/lib/create-safe-action';

type Action<TInput, TOutput> = (data: TInput) => Promise<ActionState<TInput, TOutput>>;

interface UseActionOptions<TOutput> {
    onSuccess?: (data: TOutput) => void;
    onError?: (error: string) => void;
    onComplete?: () => void;
};

export const useAction = <TInput, TOutput>(
    action: Action<TInput, TOutput>,
    options: UseActionOptions<TOutput> = {},
) => {

    const [fieldErrors, setFieldErrors] = useState<FieldErrors<TInput> | undefined>(undefined);
    const [error, setError] = useState<string | undefined>(undefined);
    const [data, setData] = useState<TOutput | undefined>(undefined);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const execute = useCallback(
        async (input: TInput) => {
            setIsLoading(true);

            try {
                const result = await action(input);

                if (!result) {
                    return;
                }

                setFieldErrors(result.fieldErrors);

                if (result.error) {
                    setError(result.error);
                    options.onError?.(result.error);
                }

                if (result.data) {
                    setData(result.data);
                    options.onSuccess?.(result.data);
                }

            } finally {
                setIsLoading(false);
                options.onComplete?.();
            }
        },
        [action, options]
    );

    return {
        execute,
        fieldErrors,
        error,
        data,
        isLoading
    };
};`;

  fs.writeFileSync('hooks/use-actions.ts', useActionsFile);

  // Custom navigate hook
  const useCustomNavigateFile = `import { useRouter } from 'next/navigation';

type StateType = {
    [key: string]: string | number | boolean;
};

export const useCustomNavigate = () => {
    const router = useRouter();

    return (path: string, state?: StateType) => {
        const url = state
            ? \`\${path}?\${new URLSearchParams(state as Record<string, string>).toString()}\`
            : path;
        router.push(url);
        window.scroll(0, 0);
    };
};`;

  fs.writeFileSync('hooks/use-custom-navigate.ts', useCustomNavigateFile);
}