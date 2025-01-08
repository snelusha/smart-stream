"use client";

import * as React from "react";

import { z } from "zod";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

const configureFormSchema = z.object({
  address: z.string().url(),
  stun: z.string().optional(),
  turn: z.object({
    url: z.string(),
    username: z.string(),
    password: z.string(),
  }),
});

type ConfigureFormValues = z.infer<typeof configureFormSchema>;

interface ConfigurationModalProps {
  open: boolean;
  onClose: () => void;
}

function intializeFormValues(config: ConfigureFormValues) {
  return {
    address: config.address ?? "",
    stun: config.stun ?? "",
    turn: {
      url: config.turn.url ?? "",
      username: config.turn.username ?? "",
      password: config.turn.password ?? "",
    },
  };
}

export function ConfigurationModal({ open, onClose }: ConfigurationModalProps) {
  const configStore = useConfigStore();

  const form = useForm<ConfigureFormValues>({
    resolver: zodResolver(configureFormSchema),
    defaultValues: intializeFormValues(
      configStore.config as ConfigureFormValues,
    ),
  });

  React.useEffect(() => {
    form.reset(intializeFormValues(configStore.config as ConfigureFormValues));
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
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>STUN server</FormLabel>
                    <FormControl>
                      <Input
                        className={cn(
                          fieldState.error &&
                            "border-destructive focus-visible:ring-destructive",
                        )}
                        placeholder="stun:stun.l.google.com:19302"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="turn.url"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>TURN server</FormLabel>
                    <FormControl>
                      <Input
                        className={cn(
                          fieldState.error &&
                            "border-destructive focus-visible:ring-destructive",
                        )}
                        placeholder="turn:turn.example.com"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="turn.username"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          className={cn(
                            fieldState.error &&
                              "border-destructive focus-visible:ring-destructive",
                          )}
                          placeholder="sudo"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="turn.password"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          className={cn(
                            fieldState.error &&
                              "border-destructive focus-visible:ring-destructive",
                          )}
                          type="password"
                          placeholder="secret"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
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
