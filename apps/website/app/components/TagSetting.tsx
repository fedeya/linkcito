import { Form, useParams, useTransition } from '@remix-run/react';
import type { FC } from 'react';
import { HiTrash } from 'react-icons/hi';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { useDisclosure } from '~/hooks';
import Button from './Button';
import { useEffect } from 'react';

type TagSettingProps = {
  id: string;
  name: string;
};

const TagSetting: FC<TagSettingProps> = ({ name, id }) => {
  const { isOpen, onClose, onOpen, setIsOpen } = useDisclosure();
  const transition = useTransition();

  const isSubmitting =
    transition.state === 'submitting' &&
    transition.submission.formData.get('action') === 'remove';

  useEffect(() => {
    if (!isSubmitting) {
      onClose();
    }
  }, [isSubmitting, onClose]);

  return (
    <div className="bg-primary-600 flex gap-2 items-center rounded-md px-4 py-2">
      <span>#{name}</span>

      <AlertDialog.Root
        open={isOpen}
        onOpenChange={value => !isSubmitting && setIsOpen(value)}
      >
        <AlertDialog.Trigger asChild>
          <button type="button" className="text-action">
            <HiTrash />
          </button>
        </AlertDialog.Trigger>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="bg-black z-10 fixed inset-0 bg-opacity-40" />
          <AlertDialog.Content className="bg-secondary text-gray z-50 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-8 rounded-lg">
            <AlertDialog.Title className="text-lg font-medium mb-2">
              Are you sure you want to delete this tag?
            </AlertDialog.Title>

            <AlertDialog.Description>
              This action cannot be undone.
            </AlertDialog.Description>

            <Form method="post">
              <label className="flex items-center my-4 gap-2">
                <input
                  type="checkbox"
                  name="deleteLinks"
                  defaultChecked={false}
                />
                <span>Delete all links of this tag</span>
              </label>

              <input type="text" name="id" value={id} readOnly hidden />

              <div className="mt-4 flex justify-end gap-4">
                <AlertDialog.Cancel asChild>
                  <Button className="w-fit">Cancel</Button>
                </AlertDialog.Cancel>
                <button
                  type="submit"
                  name="action"
                  disabled={isSubmitting}
                  value="remove"
                  className="bg-red-500 disabled:opacity-60 transition-all ease-in hover:opacity-80 px-4 py-2 text-white rounded-md"
                >
                  Delete
                </button>
              </div>
            </Form>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
};

export default TagSetting;
