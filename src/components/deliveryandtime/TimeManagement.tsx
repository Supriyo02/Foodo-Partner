import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, LayoutAnimation, Platform, UIManager, Alert, TouchableOpacity, Modal, Animated, Easing, TouchableWithoutFeedback } from "react-native";
import { Controller, useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import * as Random from "expo-random";
import { format } from "date-fns";
import { IconButton } from "react-native-paper";
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { uuidv4 } from "@/src/services/utility";
import { TimeSlot } from "@/types";
import { addTimeSlot, deleteTimeSlot, fetchTimeSlots, updateTimeSlot } from "@/src/services/dbCalls";
import { slotSchema } from "@/src/lib/validations/delivery.schema";
import CustomButton from "../CustomButton";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  // @ts-ignore
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snacks" | "Custom";

const hhmmToLabel = (hhmm: string) => {
  const [hh, mm] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setHours(hh, mm, 0, 0);
  return format(d, "hh:mm aa");
};

const timeToHHMM = (d: Date) =>
  d.getHours().toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0");

const makeDateFromHHMM = (hhmm: string) => {
  const [hh, mm] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setHours(hh, mm, 0, 0);
  return d;
};

type SlotFormValues = {
  mealType: MealType;
  startDate: Date;
  endDate: Date;
  cutoffDate: Date;
};


const TimeSlotCard: React.FC<{
  slot: TimeSlot;
  onToggle: (id: string, v: boolean) => void;
  onEdit: (s: TimeSlot) => void;
  onDelete: (id: string) => void;
}> = React.memo(({ slot, onToggle, onEdit, onDelete }) => {
  return (
    <View className="mb-4">
        <View className="rounded-3xl border border-gray-200 overflow-hidden shadow-sm bg-white p-2">
            <View className="flex-row justify-between p-2 border-b border-gray-200">
                <View className="flex-row gap-2">
                    <MaterialIcons name="fastfood" size={24} color="#ea0b2c" />
                    <Text className="font-inter-bold text-lg">{slot.mealType}</Text>
                </View>
                <Pressable
                    onPress={() => onToggle(slot.id, !slot.isActive)}
                    className={`w-14 h-8 rounded-full px-1 justify-center ${slot.isActive ? "bg-primary" : "bg-gray-200"}`}
                >
                    <View className={`w-6 h-6 rounded-full bg-white ${slot.isActive ? "ml-6" : "ml-0"}`} />
                </Pressable>
            </View>

            <View className="p-3">
                <View className="flex-row justify-between my-2">
                    <Text className="text-md font-inter text-text-secondary">Time Range</Text>
                    <Text className="font-inter-semibold text-md">
                        {hhmmToLabel(slot.start)} - {hhmmToLabel(slot.end)}
                    </Text>
                </View>
                <View className="flex-row justify-between my-2">
                    <Text className="text-md font-inter text-text-secondary mt-1">Cutoff Time</Text>
                    <Text className="font-inter-semibold text-md">Last order by {hhmmToLabel(slot.cutoff)}</Text>
                </View>
            </View>

            <View className="flex-row gap-2 w-full justify-between mb-2">
                <View>
                    <TouchableOpacity
                        onPress={() => onEdit(slot)}
                        className="bg-rose-100 border border-rose-100 rounded-3xl px-16 py-3 ml-6 items-center flex-row gap-1 justify-center"
                    >
                        <MaterialCommunityIcons name="pencil" size={16} color="#ea0b2c" />
                        <Text className="text-primary font-inter-medium">Edit</Text>
                    </TouchableOpacity>
                </View>

                <View>
                    <TouchableOpacity
                        onPress={() => onDelete(slot.id)}
                        className="bg-rose-100 border border-rose-100 rounded-3xl px-12 py-3 mr-6 items-center flex-row gap-1 justify-center"
                    >
                        <MaterialCommunityIcons name="delete-outline" size={16} color="#ea0b2c" />
                        <Text className="text-primary font-inter-medium">Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </View>
  );
});

const SlotModal: React.FC<{
  visible: boolean;
  initial?: TimeSlot | null;
  onClose: () => void;
  onSave: (payload: Omit<TimeSlot, "id">, editingId?: string) => Promise<void>;
}> = ({ visible, initial = null, onClose, onSave }) => {
  // animation
  const anim = useMemo(() => new Animated.Value(0), []);
  useEffect(() => {
    Animated.timing(anim, {
      toValue: visible ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [visible, anim]);

  // default times
  const now = new Date();
  now.setSeconds(0, 0);
  const startDefault = new Date(now);
  startDefault.setHours(9, 0, 0, 0);
  const endDefault = new Date(now);
  endDefault.setHours(11, 0, 0, 0);
  const cutoffDefault = new Date(now);
  cutoffDefault.setHours(8, 0, 0, 0);

  const { control, handleSubmit, reset, setValue, watch, formState } = useForm<SlotFormValues>({
    defaultValues: {
      mealType: (initial?.mealType ?? "Breakfast") as MealType,
      startDate: initial ? makeDateFromHHMM(initial.start) : startDefault,
      endDate: initial ? makeDateFromHHMM(initial.end) : endDefault,
      cutoffDate: initial ? makeDateFromHHMM(initial.cutoff) : cutoffDefault,
    },
    // yup resolver cast to any resolves narrow union incompatibility
    resolver: yupResolver(slotSchema) as any,
  });

  useEffect(() => {
    if (visible) {
      reset({
        mealType: (initial?.mealType ?? "Breakfast") as MealType,
        startDate: initial ? makeDateFromHHMM(initial.start) : startDefault,
        endDate: initial ? makeDateFromHHMM(initial.end) : endDefault,
        cutoffDate: initial ? makeDateFromHHMM(initial.cutoff) : cutoffDefault,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, initial]);

  const [mode, setMode] = useState<"start" | "end" | "cutoff">("start");
  const [pickerVisible, setPickerVisible] = useState(false);

  const openPicker = (m: "start" | "end" | "cutoff") => {
    setMode(m);
    setPickerVisible(true);
  };

  const onConfirm = (date: Date) => {
    setPickerVisible(false);
    if (mode === "start") setValue("startDate", date);
    else if (mode === "end") setValue("endDate", date);
    else setValue("cutoffDate", date);
  };

  const onSubmit: SubmitHandler<SlotFormValues> = async (vals) => {
    const payload: Omit<TimeSlot, "id"> = {
      mealType: vals.mealType,
      start: timeToHHMM(vals.startDate),
      end: timeToHHMM(vals.endDate),
      cutoff: timeToHHMM(vals.cutoffDate),
      isActive: initial?.isActive ?? true,
    };
    await onSave(payload, initial?.id);
  };

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });
  const opacity = anim;

  // safe first error accessor
  const firstError = (Object.values(formState.errors)[0] as any) || null;

  return (
      <Modal visible={visible} animationType="none" transparent onRequestClose={onClose}>
          <TouchableWithoutFeedback onPress={onClose}>
              <View className="flex-1 bg-black/60 justify-end">
                  <TouchableWithoutFeedback onPress={() => { /* absorb taps inside modal */ }}>
                      <Animated.View style={{ transform: [{ translateY }], opacity }} className="bg-white rounded-t-3xl px-7 pt-4 pb-6">
                          <View className="mx-auto w-12 h-1.5 rounded-full bg-gray-300 mb-3" />
                          <Text className="text-lg font-inter-semibold text-center mb-4">{initial ? "Edit Time Slot" : "Add New Time Slot"}</Text>

                          <Controller
                              control={control}
                              name="mealType"
                              render={({ field: { value, onChange } }) => (
                                  <View className="mb-4">
                                      <Text className="text-sm font-inter-bold text-gray-500 mb-2">Meal Type</Text>
                                      <View className="flex-row flex-wrap">
                                          {(["Breakfast", "Lunch", "Dinner"] as MealType[]).map((m) => {
                                              const active = value === m;
                                              return (
                                                  <Pressable
                                                      key={m}
                                                      onPress={() => onChange(m)}
                                                      className={`mr-3 mb-3 px-4 py-2 rounded-2xl ${active ? "bg-primary" : "bg-gray-200"}`}
                                                  >
                                                      <Text className={`font-inter ${active ? "text-white" : "text-black"}`}>{m}</Text>
                                                  </Pressable>
                                              );
                                          })}
                                      </View>
                                  </View>
                              )}
                          />

                          {/* Time range */}
                          <Text className="text-sm font-inter-bold text-gray-500 mb-2">Time Range</Text>
                          <View className="flex-row items-center space-x-3 mb-4">
                              <Controller
                                  control={control}
                                  name="startDate"
                                  render={({ field: { value } }) => (
                                      <TouchableOpacity onPress={() => openPicker("start")} className="flex-1 rounded-2xl py-2 px-6 bg-gray-200">
                                          <View className="flex-row items-center justify-between">
                                              <Text className="font-inter">{format(value, "hh:mm aa")}</Text>
                                              <IconButton icon="clock-outline" size={18} style={{ margin: 0 }} />
                                          </View>
                                      </TouchableOpacity>
                                  )}
                              />
                              <Text className="text-lg font-semibold px-4">-</Text>
                              <Controller
                                  control={control}
                                  name="endDate"
                                  render={({ field: { value } }) => (
                                      <TouchableOpacity onPress={() => openPicker("end")} className="flex-1 rounded-2xl py-2 px-6 bg-gray-200">
                                          <View className="flex-row items-center justify-between">
                                              <Text className="font-inter">{format(value, "hh:mm aa")}</Text>
                                              <IconButton icon="clock-outline" size={18} style={{ margin: 0 }} />
                                          </View>
                                      </TouchableOpacity>
                                  )}
                              />
                          </View>

                          <Text className="text-sm font-inter-bold text-gray-500 mb-2">Cutoff Time</Text>
                          <Controller
                              control={control}
                              name="cutoffDate"
                              render={({ field: { value } }) => (
                                  <TouchableOpacity onPress={() => openPicker("cutoff")} className="rounded-2xl mb-6 py-2 px-6 bg-gray-200">
                                      <View className="flex-row items-center justify-between">
                                          <Text className="font-inter">{format(value, "hh:mm aa")}</Text>
                                          <IconButton icon="clock-outline" size={18} style={{ margin: 0 }} />
                                      </View>
                                  </TouchableOpacity>
                              )}
                          />

                          {firstError?.message && <Text className="text-xs text-primary mb-3">{firstError.message as string}</Text>}

                          <View className="flex-row items-center justify-between space-x-3 gap-6">
                              <TouchableOpacity onPress={onClose} className="flex-1 rounded-2xl p-4 bg-gray-100 items-center">
                                  <Text className="text-sm font-inter text-gray-800">Cancel</Text>
                              </TouchableOpacity>
                              <TouchableOpacity onPress={handleSubmit(onSubmit)} className="flex-1 rounded-2xl p-4 bg-primary items-center">
                                  <Text className="text-sm text-white font-inter-semibold">{initial ? "Update Slot" : "Add Slot"}</Text>
                              </TouchableOpacity>
                          </View>
                      </Animated.View>
                  </TouchableWithoutFeedback>
              </View>
          </TouchableWithoutFeedback>

          <DateTimePickerModal isVisible={pickerVisible} mode="time" onConfirm={onConfirm} onCancel={() => setPickerVisible(false)} is24Hour={false} />
      </Modal>
  );
};


export default function MealTimeSlotsScreen() {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);

  useEffect(() => {
    loadSlots();
  }, []);

  const loadSlots = async () => {
    setLoading(true);
    try {
      const data = await fetchTimeSlots();
      setSlots(data);
    } finally {
      setLoading(false);
    }
  };


  const handleToggleActive = async (id: string, val: boolean) => {
    // optimistic
    setSlots((s) => s.map((x) => (x.id === id ? { ...x, isActive: val } : x)));
    try {
      await updateTimeSlot(id, { isActive: val } as Partial<TimeSlot>);
    } catch {
      setSlots((s) => s.map((x) => (x.id === id ? { ...x, isActive: !val } : x)));
      Alert.alert("Error", "Could not update status");
    }
  };

  const openAdd = () => {
    setEditingSlot(null);
    setModalVisible(true);
  };

  const openEdit = (s: TimeSlot) => {
    setEditingSlot(s);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete", "Do you want to delete this time slot?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteTimeSlot(id);
          setSlots((p) => p.filter((x) => x.id !== id));
        },
      },
    ]);
  };

  const onSaveSlot = async (payload: Omit<TimeSlot, "id">, editingId?: string) => {
    if (editingId) {
      await updateTimeSlot(editingId, payload as Partial<TimeSlot>);
      setSlots((p) => p.map((s) => (s.id === editingId ? { ...s, ...payload } : s)));
    } else {
      const created = await addTimeSlot(payload);
      setSlots((p) => [created, ...p]);
    }
    setModalVisible(false);
  };

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-lg font-inter-bold my-2">Meal Time Slots</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        {slots.map((s) => (
          <TimeSlotCard key={s.id} slot={s} onToggle={handleToggleActive} onEdit={openEdit} onDelete={handleDelete}/>
        ))}

        <TouchableOpacity
          onPress={openAdd}
          activeOpacity={0.9}
          className="mt-2 rounded-2xl border-2 border-dashed bg-rose-100 border-primary py-3 mx-1 flex-row gap-1 items-center justify-center"
        >
            <MaterialIcons name="add-circle-outline" size={20} color="#ea0b2c" />
            <Text className="text-primary font-inter-medium">Add New Time Slot</Text>
        </TouchableOpacity>
      </ScrollView>

      <View>
        <CustomButton onPress={() => Alert.alert("Save", "Save clicked")} title="Save Changes" />
      </View>

      <SlotModal visible={modalVisible} initial={editingSlot} onClose={() => setModalVisible(false)} onSave={onSaveSlot} />
    </View>
  );
}
