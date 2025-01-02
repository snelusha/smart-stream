"use client";

import Link from "next/link";

import { z } from "zod";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Settings2Icon } from "lucide-react";

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
  DialogTrigger,
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
  stun: z.boolean().default(false).optional(),
});

type ConfigureFormValues = z.infer<typeof configureFormSchema>;

export default function NavigationBar() {
  const form = useForm<ConfigureFormValues>({
    resolver: zodResolver(configureFormSchema),
    defaultValues: {
      address: "",
      stun: false,
    },
  });

  const configStore = useConfigStore();

  async function onSubmit(data: ConfigureFormValues) {
    configStore.setConfig({ address: data.address });
  }

  return (
    <header className="sticky top-0 z-30 [transform:_translate3d(0,0,999px)]">
      <div className="relative z-30 backdrop-blur-md">
        <div className="container relative mx-auto flex h-[var(--navigation-bar-height)] max-w-screen-2xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link className="focus-visible:outline-none" href="/">
              <h1 className="text-xl font-medium tracking-tight">stream</h1>
            </Link>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings2Icon />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <Form {...form}>
                <form
                  className="flex flex-col gap-4"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <DialogHeader>
                    <DialogTitle>Configuration settings</DialogTitle>
                    <DialogDescription>
                      Modify the necessary settings below to ensure proper
                      connection.
                    </DialogDescription>
                  </DialogHeader>
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
                            This is the endpoint used to negotiate the
                            connection.
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
        </div>
      </div>
    </header>
  );
}
