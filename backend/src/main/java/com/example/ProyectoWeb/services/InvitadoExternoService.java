package com.example.ProyectoWeb.services;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.ProyectoWeb.entity.InvitadoExterno;
import com.example.ProyectoWeb.repositories.IInvitadoExternoRepository;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InvitadoExternoService {

    @Autowired
    private IInvitadoExternoRepository invitadoExternoRepository;

    public void saveInvitadoExterno(InvitadoExterno invitadoExterno) {
        // Guarda el invitado externo en la base de datos
        invitadoExternoRepository.save(invitadoExterno);
        System.out.println("Invitado externo guardado con éxito");
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
