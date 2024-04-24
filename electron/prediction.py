import sys
import json
import pefile
import pickle
import statistics
import pandas as pd
import numpy as np
from pathlib import Path


file_name = json.loads(sys.argv[1])

# data_folder = Path("fileuploads/")

# file_to_open = data_folder / file_name


pe = pefile.PE(file_name)

df = pd.DataFrame({},index=[0])
df['SizeOfOptionalHeader']=pe.FILE_HEADER.SizeOfOptionalHeader
df['Characteristics']=pe.FILE_HEADER.Characteristics
df['MajorLinkerVersion']=pe.OPTIONAL_HEADER.MajorLinkerVersion
df['MinorLinkerVersion']=pe.OPTIONAL_HEADER.MinorLinkerVersion
df['SizeOfCode']=pe.OPTIONAL_HEADER.SizeOfCode
df['SizeOfInitializedData']=pe.OPTIONAL_HEADER.SizeOfInitializedData
df['SizeOfUninitializedData']=pe.OPTIONAL_HEADER.SizeOfUninitializedData
df['AddressOfEntryPoint']=pe.OPTIONAL_HEADER.AddressOfEntryPoint
df['BaseOfCode']=pe.OPTIONAL_HEADER.BaseOfCode
# df['BaseOfData']=pe.OPTIONAL_HEADER.BaseOfData
df['ImageBase']=pe.OPTIONAL_HEADER.ImageBase
df['SectionAlignment']=pe.OPTIONAL_HEADER.SectionAlignment
df['FileAlignment']=pe.OPTIONAL_HEADER.FileAlignment
df['MajorOperatingSystemVersion']=pe.OPTIONAL_HEADER.MajorOperatingSystemVersion
df['MinorOperatingSystemVersion']=pe.OPTIONAL_HEADER.MinorOperatingSystemVersion
df['MajorImageVersion']=pe.OPTIONAL_HEADER.MajorImageVersion
df['MinorImageVersion']=pe.OPTIONAL_HEADER.MinorImageVersion
df['MajorSubsystemVersion']=pe.OPTIONAL_HEADER.MajorSubsystemVersion
df['MinorSubsystemVersion']=pe.OPTIONAL_HEADER.MinorSubsystemVersion
df['SizeOfImage']=pe.OPTIONAL_HEADER.SizeOfImage
df['SizeOfHeaders']=pe.OPTIONAL_HEADER.SizeOfHeaders
df['CheckSum']=pe.OPTIONAL_HEADER.CheckSum
df['Subsystem']=pe.OPTIONAL_HEADER.Subsystem
df['DllCharacteristics']=pe.OPTIONAL_HEADER.DllCharacteristics
df['SizeOfStackReserve']=pe.OPTIONAL_HEADER.SizeOfStackReserve
df['SizeOfStackCommit']=pe.OPTIONAL_HEADER.SizeOfStackCommit
df['SizeOfHeapReserve']=pe.OPTIONAL_HEADER.SizeOfHeapReserve
df['SizeOfHeapCommit']=pe.OPTIONAL_HEADER.SizeOfHeapCommit
df['LoaderFlags']=pe.OPTIONAL_HEADER.LoaderFlags
df['NumberOfRvaAndSizes']=pe.OPTIONAL_HEADER.NumberOfRvaAndSizes
df['SectionsNb']=len(pe.sections)

section_entropys=[]
for sect in pe.sections:
    section_entropys.append(np.rint(sect.get_entropy()).astype(np.int64))

df['SectionsMeanEntropy']=statistics.mean(section_entropys)
df['SectionsMinEntropy']=min(section_entropys)
df['SectionsMaxEntropy']=max(section_entropys)

section_rawdata=[]
for sect in pe.sections:
    section_rawdata.append(np.rint(sect.SizeOfRawData).astype(np.int64))

df['SectionsMeanRawsize']=statistics.mean(section_rawdata)
df['SectionsMinRawsize']=min(section_rawdata)
df['SectionMaxRawsize']=max(section_rawdata)

section_virtualsize=[]
for sect in pe.sections:
    section_virtualsize.append(np.rint(sect.Misc_VirtualSize).astype(np.int64))

df['SectionsMeanVirtualsize']=statistics.mean(section_virtualsize)
df['SectionsMinVirtualsize']=min(section_virtualsize)
df['SectionMaxVirtualsize']=max(section_virtualsize)

model = pickle.load(open('./electron/malware_predictor_model','rb'))
prediction = model.predict(df)

print(prediction[0])