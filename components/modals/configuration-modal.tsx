"use client";

import * as React from "react";

import { z } from "zod";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";

import { useConfigStore } from "@/stores/config";

import { cn } from "@/styles/utils";

import type { SubmitHandler } from "react-hook-form";

const configureFormSchema = z.object({
  address: z.string().url(),
  stun: z.boolean().default(false).optional(),
});

type ConfigureFormValues = z.infer<typeof configureFormSchema>;

interface ConfigurationModalProps {
  open: boolean;
  onClose: () => void;
}

export function ConfigurationModal({ open, onClose }: ConfigurationModalProps) {
  const configStore = useConfigStore();

  const form = useForm<ConfigureFormValues>({
    resolver: zodResolver(configureFormSchema),
    defaultValues: {
      address: configStore.config.address || "",
      stun: configStore.config.stun,
    },
  });

  React.useEffect(() => {
    form.reset({
      address: configStore.config.address || "",
      stun: configStore.config.stun,
    });
  }, [configStore.config]);

  const handleOpenChange = (open: boolean) => {
    if (open) return;
    onClose?.();
    form.reset({
      address: configStore.config.address || "",
      stun: configStore.config.stun,
    });
  };

  const onSubmit = form.handleSubmit((values) => {
    configStore.setConfig(values);
    handleOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure Connection</DialogTitle>
          <DialogDescription>
            Configure the connection to the signaling server.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="address"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Server address</FormLabel>
                    <FormControl>
                      <Input
                        className={cn(
                          fieldState.error &&
                            "border-destructive focus-visible:ring-destructive",
                        )}
                        placeholder="https://example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This is the endpoint used to negotiate the connection.
                    </FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stun"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-2 leading-none">
                      <FormLabel>Use STUN server</FormLabel>
                      <FormDescription>
                        Enable this option to use a STUN server for NAT
                        traversal.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
              <Button>Configure</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
