"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { format } from "date-fns"
import { CalendarIcon, MapPinIcon, DropletIcon } from 'lucide-react'
import { createClient } from "@supabase/supabase-js"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const supabaseUrl = "https://qqwbholpjtwptvqwfyhy.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxd2Job2xwanR3cHR2cXdmeWh5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMzEwNjQ1NiwiZXhwIjoyMDM4NjgyNDU2fQ.sHK3cuZL1_rq3bOpFhu5m-wVLHDKSjYSZRKNKqhSHGA" // Replace with your actual Supabase Anon Key

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

type FormData = {
  location: string
  rainDate: Date
  waterLevel: number
}

const locationOptions = [
  { value: "-6.9586756,110.2278471", label: "Kantor DLH Kota Semarang" },
  { value: "-7.0019305,110.3358617", label: "SD Negeri Bringin 02" },
  { value: "-6.9803227,110.3871209", label: "SD Negeri Karangayu 02" },
  { value: "-7.0071388,110.4034657", label: "Kantor Kecamatan Gajah Mungkur" },
  { value: "-6.9649253,110.4578284", label: "SD Negeri Gebangsari 02" },
  { value: "-7.0112112,110.4602599", label: "Kantor Kecamatan Pedurungan" },
  { value: "-7.0410422,110.2901878", label: "SD Wonoplembon 01" },
  { value: "-7.0409499,110.2515631", label: "Balai Penyuluh Pertanian - Mijen" },
  { value: "-7.0395878,110.3629892", label: "SD Negeri Sadeng 02" },
  { value: "-7.0637616,110.3466957", label: "SD Negeri Jatirejo" },
  { value: "-7.0671702,110.3605648", label: "Kelurahan Nongkosawit" },
  { value: "-7.106038,110.3866514", label: "SD Negeri Sumurejo 01" },
]

export function RainDataForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm<FormData>({
    defaultValues: {
      location: "",
      rainDate: undefined,
      waterLevel: 0,
    },
  })

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from("athus_data")
        .insert([
          {
            location: data.location,
            rain_date: data.rainDate.toISOString(),
            water_level: data.waterLevel,
          },
        ])

      if (error) throw error

      alert("Data berhasil disimpan!")
      form.reset()
    } catch (error) {
      console.error("Error inserting data:", error)
      alert("Terjadi kesalahan saat menyimpan data.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Lokasi */}
          <FormField
            control={form.control}
            name="location"
            rules={{
              required: "Lokasi harus dipilih.",
              validate: value =>
                locationOptions.some(option => option.value === value) || "Lokasi tidak valid.",
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lokasi</FormLabel>
                <FormControl>
                  <div className="relative">
                    <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Pilih lokasi" />
                      </SelectTrigger>
                      <SelectContent>
                        {locationOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </FormControl>
                <FormDescription>
                  Pilih lokasi tempat Athus anda.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tanggal Hujan */}
          <FormField
            control={form.control}
            name="rainDate"
            rules={{
              required: "Tanggal hujan harus dipilih.",
              validate: value => {
                if (!(value instanceof Date) || isNaN(value.getTime())) {
                  return "Tanggal tidak valid."
                }
                if (value > new Date()) {
                  return "Tanggal tidak boleh di masa depan."
                }
                if (value < new Date("1900-01-01")) {
                  return "Tanggal terlalu awal."
                }
                return true
              }
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tanggal Hujan</FormLabel>
                <FormControl>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-between pl-4 pr-4",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="h-5 w-5 text-gray-400" />
                        <span className="flex-1 text-left">
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">Pilih tanggal</span>
                          )}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormDescription>
                  Pilih tanggal ketika hujan terjadi.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Ketinggian Air */}
          <FormField
            control={form.control}
            name="waterLevel"
            rules={{
              required: "Ketinggian air harus diisi.",
              min: {
                value: 0,
                message: "Ketinggian air tidak boleh negatif.",
              },
              validate: value => {
                if (isNaN(value)) {
                  return "Ketinggian air harus berupa angka."
                }
                return true
              }
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ketinggian Air (mm)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <DropletIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      type="number"
                      {...field}
                      className="pl-10"
                      placeholder="Masukkan ketinggian air"
                      step="any"
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Masukkan ketinggian air dalam milimeter.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tombol Submit */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors text-white font-semibold rounded-lg"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Data"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
