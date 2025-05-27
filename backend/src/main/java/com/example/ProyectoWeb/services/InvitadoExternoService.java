package com.example.ProyectoWeb.services;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.ProyectoWeb.entity.InvitadoExterno;
import com.example.ProyectoWeb.entity.Evento;
import com.example.ProyectoWeb.repositories.IInvitadoExternoRepository;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InvitadoExternoService {

    @Autowired
    private IInvitadoExternoRepository invitadoExternoRepository;

    public InvitadoExterno saveInvitadoExterno(InvitadoExterno invitadoExterno) {
        // Validar que los campos obligatorios estén presentes
        if (invitadoExterno.getNombre() == null || invitadoExterno.getNombre().isEmpty()) {
            throw new RuntimeException("El nombre del invitado es obligatorio");
        }
        if (invitadoExterno.getApellido() == null || invitadoExterno.getApellido().isEmpty()) {
            throw new RuntimeException("El apellido del invitado es obligatorio");
        }
        if (invitadoExterno.getCorreo() == null || invitadoExterno.getCorreo().isEmpty()) {
            throw new RuntimeException("El correo del invitado es obligatorio");
        }
        if (invitadoExterno.getEvento() == null) {
            throw new RuntimeException("El invitado debe estar asociado a un evento");
        }
        
        // Verificar si ya existe un invitado con el mismo correo para este evento
        Optional<InvitadoExterno> existingInvitado = invitadoExternoRepository.findByCorreo(invitadoExterno.getCorreo());
        if (existingInvitado.isPresent() && 
            existingInvitado.get().getEvento().getId().equals(invitadoExterno.getEvento().getId())) {
            throw new RuntimeException("Ya existe un invitado con este correo en el evento");
        }
        
        return invitadoExternoRepository.save(invitadoExterno);
    }

    public InvitadoExterno getInvitadoExternoById(Long id) {
        return invitadoExternoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invitado externo no encontrado"));
    }

    public InvitadoExterno getInvitadoExternoByCorreo(String correo) {
        return invitadoExternoRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Invitado externo no encontrado"));
    }

    public List<InvitadoExterno> getInvitadosExternosByEmpresa(String empresa) {
        return invitadoExternoRepository.findByEmpresa(empresa);
    }

    public List<InvitadoExterno> getInvitadosExternosByNombreAndApellido(String nombre, String apellido) {
        return invitadoExternoRepository.findByNombreAndApellido(nombre, apellido);
    }

    public InvitadoExterno updateInvitadoExternoById(InvitadoExterno request, Long id) {
        InvitadoExterno invitadoExterno = invitadoExternoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invitado externo no encontrado"));

        invitadoExterno.setNombre(request.getNombre());
        invitadoExterno.setApellido(request.getApellido());
        invitadoExterno.setCorreo(request.getCorreo());
        invitadoExterno.setTelefono(request.getTelefono());
        saveInvitadoExterno(invitadoExterno);

        return invitadoExterno;
    }

    public String deleteInvitadoExterno(Long id) {
        InvitadoExterno invitadoExterno = invitadoExternoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invitado externo no encontrado"));
        invitadoExternoRepository.delete(invitadoExterno);
        return "Invitado externo eliminado";
    }
}
